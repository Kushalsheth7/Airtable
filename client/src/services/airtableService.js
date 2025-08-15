import api from './api';

export const airtableService = {
  // Get user's Airtable bases
  getBases: async () => {
    const response = await api.get('/airtable/bases');
    return response.data;
  },

  // Get tables from a specific base
  getTables: async (baseId) => {
    const response = await api.get(`/airtable/bases/${baseId}/tables`);
    return response.data;
  },

  // Get fields from a specific table
  getTableFields: async (baseId, tableId) => {
    const response = await api.get(`/airtable/bases/${baseId}/tables/${tableId}/fields`);
    return response.data;
  },

  // Test Airtable connection
  testConnection: async () => {
    const response = await api.get('/airtable/test-connection');
    return response.data;
  }
};
