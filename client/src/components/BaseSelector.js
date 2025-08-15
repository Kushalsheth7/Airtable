import React, { useState, useEffect } from 'react';
import { airtableService } from '../services/airtableService';
import toast from 'react-hot-toast';
import { Database, ChevronRight, ArrowLeft } from 'lucide-react';

const BaseSelector = ({ onBaseSelect, selectedBase, onBack }) => {
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBases();
  }, []);

  const loadBases = async () => {
    try {
      console.log('Loading bases...');
      const response = await airtableService.getBases();
      console.log('Bases response:', response);

      if (response && response.bases) {
        setBases(response.bases);
        console.log('Bases loaded successfully:', response.bases.length);
      } else {
        console.error('Invalid response format:', response);
        toast.error('Invalid response from Airtable API');
      }
    } catch (error) {
      console.error('Error loading bases:', error);
      toast.error(`Failed to load Airtable bases: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Select Airtable Base</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Select Airtable Base</h2>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={loadBases}
            className="btn-secondary text-sm"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
      </div>

      <p className="text-gray-600">
        Choose the Airtable base that contains the table you want to create a form for.
      </p>

      {bases.length === 0 ? (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bases found
          </h3>
          <p className="text-gray-600">
            Make sure you have access to at least one Airtable base.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bases.map((base) => (
            <button
              key={base.id}
              onClick={(e) => {
                e.preventDefault();
                console.log('Base selected:', base);
                onBaseSelect(base);
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                selectedBase?.id === base.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{base.name}</h3>
                    <p className="text-sm text-gray-500">
                      Permission: {base.permissionLevel}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BaseSelector;
