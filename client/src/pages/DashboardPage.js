import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formService } from '../services/formService';
import toast from 'react-hot-toast';
import { Plus, FormInput, ExternalLink, Trash2, Edit, Calendar, BarChart3 } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const { forms } = await formService.getForms();
      setForms(forms);
    } catch (error) {
      console.error('Error loading forms:', error);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (formId, formTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${formTitle}"?`)) {
      return;
    }

    try {
      await formService.deleteForm(formId);
      toast.success('Form deleted successfully');
      loadForms(); // Reload forms
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
    }
  };

  const copyFormUrl = (formId) => {
    const url = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(url);
    toast.success('Form URL copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your Airtable forms and view submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FormInput className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Forms</p>
                <p className="text-2xl font-bold text-gray-900">{forms.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {forms.reduce((total, form) => total + form.submissionCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-airtable-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-airtable-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {forms.filter(form => {
                    const formDate = new Date(form.createdAt);
                    const now = new Date();
                    return formDate.getMonth() === now.getMonth() && 
                           formDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Forms Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Forms</h2>
          <Link
            to="/forms/new"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Create New Form</span>
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className="card text-center py-12">
            <FormInput className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No forms yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first Airtable form
            </p>
            <Link
              to="/forms/new"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Create Your First Form</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div key={form.id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {form.title}
                  </h3>
                  <div className="flex space-x-1">
                    <Link
                      to={`/forms/${form.id}/edit`}
                      className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                      title="Edit form"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDeleteForm(form.id, form.title)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                      title="Delete form"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {form.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {form.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Base:</span>
                    <span className="ml-1 truncate">{form.airtableBaseName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Table:</span>
                    <span className="ml-1 truncate">{form.airtableTableName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Submissions:</span>
                    <span className="ml-1">{form.submissionCount}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => copyFormUrl(form.id)}
                    className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1"
                  >
                    <ExternalLink size={14} />
                    <span>Copy Link</span>
                  </button>
                  <Link
                    to={`/form/${form.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-primary text-sm flex items-center justify-center space-x-1"
                  >
                    <span>Preview</span>
                  </Link>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Created {new Date(form.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
