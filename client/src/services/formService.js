import api from './api';

export const formService = {
  // Create a new form
  createForm: async (formData) => {
    const response = await api.post('/forms', formData);
    return response.data;
  },

  // Get all forms for the authenticated user
  getForms: async () => {
    const response = await api.get('/forms');
    return response.data;
  },

  // Get a specific form by ID
  getForm: async (formId) => {
    const response = await api.get(`/forms/${formId}`);
    return response.data;
  },

  // Update a form
  updateForm: async (formId, formData) => {
    const response = await api.put(`/forms/${formId}`, formData);
    return response.data;
  },

  // Delete a form
  deleteForm: async (formId) => {
    const response = await api.delete(`/forms/${formId}`);
    return response.data;
  },

  // Submit a form
  submitForm: async (formId, responses) => {
    const response = await api.post(`/forms/${formId}/submit`, { responses });
    return response.data;
  },

  // Get form submissions (for form owner)
  getFormSubmissions: async (formId) => {
    const response = await api.get(`/forms/${formId}/submissions`);
    return response.data;
  }
};
