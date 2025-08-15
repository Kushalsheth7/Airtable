import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Database, FormInput, Zap, Shield } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Database,
      title: 'Airtable Integration',
      description: 'Connect directly to your Airtable bases and tables with secure OAuth authentication.'
    },
    {
      icon: FormInput,
      title: 'Dynamic Form Builder',
      description: 'Create custom forms using your Airtable fields with an intuitive drag-and-drop interface.'
    },
    {
      icon: Zap,
      title: 'Conditional Logic',
      description: 'Show or hide fields based on previous answers to create smart, adaptive forms.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data stays in Airtable. We only facilitate the connection with enterprise-grade security.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-airtable-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Build Dynamic Forms with{' '}
              <span className="text-primary-600">Airtable</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create custom forms using your Airtable data, apply conditional logic, 
              and save responses directly back to your bases. No coding required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-3"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn-airtable inline-flex items-center space-x-2 text-lg px-8 py-3"
                >
                  <span>Get Started with Airtable</span>
                  <ArrowRight size={20} />
                </Link>
              )}
              <a
                href="#features"
                className="btn-secondary inline-flex items-center space-x-2 text-lg px-8 py-3"
              >
                <span>Learn More</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create professional forms connected to your Airtable data
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect Airtable
              </h3>
              <p className="text-gray-600">
                Securely connect your Airtable account using OAuth authentication
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Build Your Form
              </h3>
              <p className="text-gray-600">
                Select your base, table, and fields to create a custom form with conditional logic
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Share & Collect
              </h3>
              <p className="text-gray-600">
                Share your form and watch responses automatically save to your Airtable
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already creating amazing forms with Airtable
          </p>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center space-x-2"
            >
              <span>Start Building Forms</span>
              <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
