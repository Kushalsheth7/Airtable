const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const AirtableService = require('../services/airtableService');

const router = express.Router();

// Get user's Airtable bases
router.get('/bases', authenticateToken, async (req, res) => {
  try {
    const airtableService = new AirtableService(req.user.airtableAccessToken);
    const bases = await airtableService.getBases();
    
    res.json({
      bases: bases.map(base => ({
        id: base.id,
        name: base.name,
        permissionLevel: base.permissionLevel
      }))
    });
  } catch (error) {
    console.error('Error fetching bases:', error);
    res.status(500).json({
      error: 'Failed to fetch Airtable bases',
      message: error.message
    });
  }
});

// Get tables from a specific base
router.get('/bases/:baseId/tables', authenticateToken, async (req, res) => {
  try {
    const { baseId } = req.params;
    const airtableService = new AirtableService(req.user.airtableAccessToken);
    const tables = await airtableService.getTables(baseId);
    
    res.json({
      tables: tables.map(table => ({
        id: table.id,
        name: table.name,
        description: table.description,
        primaryFieldId: table.primaryFieldId
      }))
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      error: 'Failed to fetch Airtable tables',
      message: error.message
    });
  }
});

// Get fields from a specific table
router.get('/bases/:baseId/tables/:tableId/fields', authenticateToken, async (req, res) => {
  try {
    const { baseId, tableId } = req.params;
    const airtableService = new AirtableService(req.user.airtableAccessToken);
    const fields = await airtableService.getTableFields(baseId, tableId);
    
    res.json({
      fields: fields.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type,
        description: field.description,
        options: field.options || null
      }))
    });
  } catch (error) {
    console.error('Error fetching table fields:', error);
    res.status(500).json({
      error: 'Failed to fetch table fields',
      message: error.message
    });
  }
});

// Test Airtable connection
router.get('/test-connection', authenticateToken, async (req, res) => {
  try {
    const airtableService = new AirtableService(req.user.airtableAccessToken);
    const userProfile = await airtableService.getUserProfile();
    
    res.json({
      connected: true,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name
      }
    });
  } catch (error) {
    console.error('Error testing Airtable connection:', error);
    res.status(500).json({
      connected: false,
      error: 'Failed to connect to Airtable',
      message: error.message
    });
  }
});

module.exports = router;
