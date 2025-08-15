const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');
const AirtableService = require('../services/airtableService');

const router = express.Router();

// Store code verifiers temporarily (in production, use Redis or database)
const codeVerifiers = new Map();

// Helper functions for PKCE
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Handle preflight requests
router.options('/airtable/url', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Generate Airtable OAuth URL with PKCE
router.get('/airtable/url', (req, res) => {
  try {
    const clientId = process.env.AIRTABLE_CLIENT_ID;
    const redirectUri = process.env.AIRTABLE_REDIRECT_URI;
    const scope = 'data.records:read data.records:write schema.bases:read';

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = 'airtable_oauth_' + Date.now();

    // Store code verifier for later use
    codeVerifiers.set(state, codeVerifier);

    // Clean up old verifiers (simple cleanup, in production use TTL)
    if (codeVerifiers.size > 100) {
      const firstKey = codeVerifiers.keys().next().value;
      codeVerifiers.delete(firstKey);
    }

    const authUrl = `https://airtable.com/oauth2/v1/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`;

    console.log('Generated OAuth URL with PKCE:', {
      clientId: clientId.substring(0, 8) + '...',
      redirectUri,
      state,
      codeChallenge: codeChallenge.substring(0, 8) + '...'
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      error: 'Failed to generate authentication URL'
    });
  }
});

// Handle OAuth callback
router.post('/airtable/callback', async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Authorization code is required'
      });
    }

    // Basic state validation (in production, you'd want more robust validation)
    if (!state || !state.startsWith('airtable_oauth_')) {
      return res.status(400).json({
        error: 'Invalid state parameter'
      });
    }

    // Get the code verifier for this state
    const codeVerifier = codeVerifiers.get(state);
    if (!codeVerifier) {
      return res.status(400).json({
        error: 'Invalid or expired state parameter'
      });
    }

    // Clean up the code verifier
    codeVerifiers.delete(state);

    console.log('Exchanging code for token with PKCE:', {
      client_id: process.env.AIRTABLE_CLIENT_ID,
      redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
      code: code.substring(0, 8) + '...',
      state: state,
      hasCodeVerifier: !!codeVerifier,
      timestamp: new Date().toISOString()
    });

    // Try multiple approaches for token exchange
    const clientId = process.env.AIRTABLE_CLIENT_ID;
    const clientSecret = process.env.AIRTABLE_CLIENT_SECRET;
    const redirectUri = process.env.AIRTABLE_REDIRECT_URI;

    console.log('Attempting token exchange with multiple methods...');

    // Use Basic Authentication (Method 2) since it accepts our credentials
    console.log('Using Basic Authentication for token exchange');
    const tokenData = new URLSearchParams({
      redirect_uri: redirectUri,
      code: code,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier
    });

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await axios.post('https://airtable.com/oauth2/v1/token', tokenData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      }
    });

    console.log('Token exchange SUCCESS!');

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    console.log('Token response:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      expiresIn: expires_in
    });

    // Get user profile from Airtable
    const airtableService = new AirtableService(access_token);
    console.log('Fetching user profile from Airtable...');
    const userProfile = await airtableService.getUserProfile();
    console.log('User profile received:', userProfile);

    // Find or create user in our database
    let user = await User.findOne({ airtableId: userProfile.id });

    if (user) {
      // Update existing user
      user.airtableAccessToken = access_token;
      user.airtableRefreshToken = refresh_token;
      user.tokenExpiresAt = new Date(Date.now() + (expires_in * 1000));
      // Keep existing email/name if available, or use defaults
      if (userProfile.email) user.email = userProfile.email;
      if (userProfile.name) user.name = userProfile.name;
      await user.save();
    } else {
      // Create new user with fallback values
      user = new User({
        airtableId: userProfile.id,
        email: userProfile.email || `user-${userProfile.id}@airtable.local`,
        name: userProfile.name || `Airtable User ${userProfile.id.slice(-4)}`,
        airtableAccessToken: access_token,
        airtableRefreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + (expires_in * 1000))
      });
      await user.save();
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        airtableId: user.airtableId
      }
    });

  } catch (error) {
    console.error('OAuth callback error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    res.status(500).json({
      error: 'Authentication failed',
      message: error.response?.data?.error_description || error.message
    });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      airtableId: req.user.airtableId
    }
  });
});

// Test endpoint to verify credentials
router.get('/test-credentials', (req, res) => {
  const clientId = process.env.AIRTABLE_CLIENT_ID;
  const clientSecret = process.env.AIRTABLE_CLIENT_SECRET;

  res.json({
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    clientIdLength: clientId ? clientId.length : 0,
    clientSecretLength: clientSecret ? clientSecret.length : 0,
    clientIdPreview: clientId ? clientId.substring(0, 8) + '...' : 'missing'
  });
});

// Test endpoint to verify Airtable connectivity
router.get('/test-airtable', async (req, res) => {
  try {
    const clientId = process.env.AIRTABLE_CLIENT_ID;
    const clientSecret = process.env.AIRTABLE_CLIENT_SECRET;

    // Test a simple request to Airtable (this should fail but give us more info)
    const testData = new URLSearchParams({
      grant_type: 'client_credentials'
    });

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios.post('https://airtable.com/oauth2/v1/token', testData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      }
    });

    res.json({ success: true, response: response.data });
  } catch (error) {
    res.json({
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    });
  }
});

// Test endpoint with exact same format as our OAuth request
router.get('/test-oauth-format', async (req, res) => {
  try {
    const clientId = process.env.AIRTABLE_CLIENT_ID;
    const clientSecret = process.env.AIRTABLE_CLIENT_SECRET;

    // Use a dummy code and verifier to test the exact format
    const testData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: 'http://localhost:3000/auth/callback',
      code: 'dummy_code_for_testing',
      grant_type: 'authorization_code',
      code_verifier: 'dummy_verifier_for_testing'
    });

    console.log('Test OAuth format request:', testData.toString());

    const response = await axios.post('https://airtable.com/oauth2/v1/token', testData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    res.json({ success: true, response: response.data });
  } catch (error) {
    res.json({
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
      requestData: {
        client_id: process.env.AIRTABLE_CLIENT_ID,
        redirect_uri: 'http://localhost:3000/auth/callback',
        hasClientSecret: !!process.env.AIRTABLE_CLIENT_SECRET
      }
    });
  }
});

// Logout (invalidate token on client side)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
