import api from './api';

export const authService = {
  // Get Airtable OAuth URL
  getAirtableAuthUrl: async () => {
    const response = await api.get('/auth/airtable/url');
    return response.data;
  },

  // Handle OAuth callback
  handleCallback: async (code, state) => {
    const response = await api.post('/auth/airtable/callback', { code, state });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};
