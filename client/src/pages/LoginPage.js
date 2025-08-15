import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { ExternalLink, Database, Shield, Zap } from 'lucide-react';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAirtableLogin = async () => {
    setLoading(true);
    console.log('Starting login process...');

    // First try axios
    try {
      console.log('Trying axios request...');
      const response = await authService.getAirtableAuthUrl();
      console.log('✅ Axios success - Auth service response:', response);

      const { authUrl } = response;
      console.log('Auth URL:', authUrl);

      if (!authUrl) {
        throw new Error('No auth URL received from server');
      }

      console.log('Redirecting to:', authUrl);
      window.location.href = authUrl;
      return; // Success, exit function
    } catch (axiosError) {
      console.log('❌ Axios failed:', axiosError.message);
      console.log('Trying direct fetch fallback...');
    }

    // Fallback to direct fetch
    try {
      const directResponse = await fetch('https://airtable-hrcp.onrender.com/api/auth/airtable/url', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Direct fetch response status:', directResponse.status);

      if (!directResponse.ok) {
        throw new Error(`HTTP ${directResponse.status}: ${directResponse.statusText}`);
      }

      const data = await directResponse.json();
      console.log('✅ Direct fetch success - Response data:', data);

      if (!data.authUrl) {
        throw new Error('No auth URL received from server');
      }

      console.log('Redirecting to:', data.authUrl);
      window.location.href = data.authUrl;
    } catch (fetchError) {
      console.error('❌ Both axios and fetch failed');
      console.error('Fetch error:', fetchError);
      toast.error('Failed to initiate login. Please try again.');
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Database,
      title: 'Direct Airtable Integration',
      description: 'Connect seamlessly with your existing Airtable bases and tables'
    },
    {
      icon: Shield,
      title: 'Secure OAuth Authentication',
      description: 'Your credentials stay safe with industry-standard OAuth 2.0'
    },
    {
      icon: Zap,
      title: 'Instant Setup',
      description: 'Start building forms immediately after connecting your account'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-airtable-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">AF</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Airtable Forms
          </h2>
          <p className="text-gray-600">
            Connect your Airtable account to start building dynamic forms
          </p>
        </div>

        <div className="card">
          <button
            onClick={handleAirtableLogin}
            disabled={loading}
            className="w-full btn-airtable flex items-center justify-center space-x-2 py-3 text-lg"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Database size={20} />
                <span>Connect with Airtable</span>
                <ExternalLink size={16} />
              </>
            )}
          </button>

          <div className="mt-6 space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <benefit.icon className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            By connecting your account, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
