// Utility functions for handling different field types

export const getFieldIcon = (fieldType) => {
  switch (fieldType) {
    case 'singleLineText':
      return '📝';
    case 'multilineText':
      return '📄';
    case 'singleSelect':
      return '🔘';
    case 'multipleSelect':
      return '☑️';
    case 'attachment':
      return '📎';
    default:
      return '❓';
  }
};

export const getFieldTypeName = (fieldType) => {
  switch (fieldType) {
    case 'singleLineText':
      return 'Short Text';
    case 'multilineText':
      return 'Long Text';
    case 'singleSelect':
      return 'Single Select';
    case 'multipleSelect':
      return 'Multi Select';
    case 'attachment':
      return 'File Upload';
    default:
      return fieldType;
  }
};

export const getFieldDescription = (fieldType) => {
  switch (fieldType) {
    case 'singleLineText':
      return 'Single line of text input';
    case 'multilineText':
      return 'Multi-line text area for longer responses';
    case 'singleSelect':
      return 'Dropdown with predefined options (single choice)';
    case 'multipleSelect':
      return 'Checkboxes with predefined options (multiple choices)';
    case 'attachment':
      return 'File upload field for documents and images';
    default:
      return 'Unknown field type';
  }
};

export const getSupportedFieldTypes = () => [
  'singleLineText',
  'multilineText',
  'singleSelect',
  'multipleSelect',
  'attachment'
];

export const isFieldTypeSupported = (fieldType) => {
  return getSupportedFieldTypes().includes(fieldType);
};

export const canFieldTriggerConditionalLogic = (fieldType) => {
  return ['singleLineText', 'multilineText', 'singleSelect', 'multipleSelect'].includes(fieldType);
};

export const getDefaultFieldConfig = (airtableField) => {
  return {
    airtableFieldId: airtableField.id,
    airtableFieldName: airtableField.name,
    fieldType: airtableField.type,
    label: airtableField.name,
    required: false,
    order: 0,
    options: airtableField.options?.choices || [],
    conditionalLogic: {
      enabled: false,
      showWhen: 'all',
      conditions: []
    }
  };
};

export const validateFieldValue = (field, value) => {
  const errors = [];
  
  // Check required fields
  if (field.required && (!value || value === '')) {
    errors.push(`${field.label} is required`);
  }
  
  // Type-specific validation
  switch (field.fieldType) {
    case 'singleSelect':
      if (value && field.options && !field.options.some(opt => opt.name === value)) {
        errors.push(`Invalid option selected for ${field.label}`);
      }
      break;
      
    case 'multipleSelect':
      if (value && Array.isArray(value)) {
        const invalidOptions = value.filter(v => 
          !field.options.some(opt => opt.name === v)
        );
        if (invalidOptions.length > 0) {
          errors.push(`Invalid options selected for ${field.label}: ${invalidOptions.join(', ')}`);
        }
      }
      break;
      
    case 'attachment':
      if (value && value.size > 10 * 1024 * 1024) { // 10MB limit
        errors.push(`File size for ${field.label} must be less than 10MB`);
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
