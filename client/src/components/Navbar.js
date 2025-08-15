import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Plus, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AF</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                Airtable Forms
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  to="/forms/new"
                  className="flex items-center space-x-1 bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <Plus size={16} />
                  <span>New Form</span>
                </Link>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User size={16} />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Login with Airtable
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
