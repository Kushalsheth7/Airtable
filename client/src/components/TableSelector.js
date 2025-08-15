import React, { useState, useEffect } from 'react';
import { airtableService } from '../services/airtableService';
import toast from 'react-hot-toast';
import { Table, ChevronRight, ArrowLeft } from 'lucide-react';

const TableSelector = ({ baseId, onTableSelect, selectedTable, onBack }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, [baseId]);

  const loadTables = async () => {
    try {
      const { tables } = await airtableService.getTables(baseId);
      setTables(tables);
    } catch (error) {
      console.error('Error loading tables:', error);
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Select Table</h2>
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
        <h2 className="text-xl font-semibold text-gray-900">Select Table</h2>
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      <p className="text-gray-600">
        Choose the table where form responses will be saved.
      </p>

      {tables.length === 0 ? (
        <div className="text-center py-12">
          <Table className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tables found
          </h3>
          <p className="text-gray-600">
            This base doesn't contain any tables.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tables.map((table) => (
            <button
              type="button"
              key={table.id}
              onClick={() => onTableSelect(table)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left hover:border-primary-300 hover:bg-primary-50 ${
                selectedTable?.id === table.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Table className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{table.name}</h3>
                    {table.description && (
                      <p className="text-sm text-gray-500 truncate max-w-md">
                        {table.description}
                      </p>
                    )}
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

export default TableSelector;
