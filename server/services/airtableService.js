const axios = require('axios');

class AirtableService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://api.airtable.com/v0';
    this.metaURL = 'https://api.airtable.com/v0/meta';
  }

  // Get user's bases
  async getBases() {
    try {
      const response = await axios.get(`${this.metaURL}/bases`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      return response.data.bases;
    } catch (error) {
      console.error('Error fetching bases:', error.response?.data || error.message);
      throw new Error('Failed to fetch Airtable bases');
    }
  }

  // Get tables from a specific base
  async getTables(baseId) {
    try {
      const response = await axios.get(`${this.metaURL}/bases/${baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      return response.data.tables;
    } catch (error) {
      console.error('Error fetching tables:', error.response?.data || error.message);
      throw new Error('Failed to fetch Airtable tables');
    }
  }

  // Get fields from a specific table
  async getTableFields(baseId, tableId) {
    try {
      const tables = await this.getTables(baseId);
      const table = tables.find(t => t.id === tableId);
      
      if (!table) {
        throw new Error('Table not found');
      }

      // Filter only supported field types
      const supportedTypes = [
        'singleLineText',
        'multilineText', 
        'singleSelect',
        'multipleSelect',
        'attachment'
      ];

      const supportedFields = table.fields.filter(field => 
        supportedTypes.includes(field.type)
      );

      return supportedFields;
    } catch (error) {
      console.error('Error fetching table fields:', error.response?.data || error.message);
      throw new Error('Failed to fetch table fields');
    }
  }

  // Create a new record in Airtable
  async createRecord(baseId, tableId, fields) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${baseId}/${tableId}`,
        {
          fields: fields
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating record:', error.response?.data || error.message);
      throw new Error('Failed to create record in Airtable');
    }
  }

  // Upload attachment to Airtable
  async uploadAttachment(baseId, tableId, recordId, fieldName, fileBuffer, fileName, mimeType) {
    try {
      // First, upload the file to get a URL
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: mimeType
      });

      // Note: Airtable doesn't have a direct file upload API
      // In a real implementation, you'd need to upload to a service like AWS S3
      // and then provide the URL to Airtable
      
      throw new Error('File upload not implemented - requires external file storage service');
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }

  // Get user profile information
  async getUserProfile() {
    try {
      const response = await axios.get('https://api.airtable.com/v0/meta/whoami', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error.response?.data || error.message);
      throw new Error('Failed to fetch user profile');
    }
  }
}

module.exports = AirtableService;
