import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const hasProcessed = useRef(false); // Prevent multiple executions

  useEffect(() => {
    // Prevent multiple executions in React Strict Mode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(searchParams.get('error_description') || 'Authentication failed');
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        if (!state) {
          throw new Error('No state parameter received');
        }

        // Exchange code for token
        const { token, user } = await authService.handleCallback(code, state);

        // Login user
        login(token, user);

        setStatus('success');
        toast.success('Successfully connected to Airtable!');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');

        // Only show toast error if it's not a network retry issue
        if (!error.message.includes('Network Error') && !error.message.includes('Request failed')) {
          toast.error(error.message || 'Authentication failed');
        }

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-airtable-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connecting to Airtable...
              </h2>
              <p className="text-gray-600">
                Please wait while we complete the authentication process.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Successfully Connected!
              </h2>
              <p className="text-gray-600">
                Redirecting you to the dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600">
                There was an error connecting to Airtable. Redirecting you back to login...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
