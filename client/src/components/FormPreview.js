import React, { useState } from 'react';
import { Eye } from 'lucide-react';

const FormPreview = ({ title, description, fields }) => {
  const [responses, setResponses] = useState({});

  // Evaluate conditional logic
  const isFieldVisible = (field) => {
    if (!field.conditionalLogic.enabled || field.conditionalLogic.conditions.length === 0) {
      return true;
    }

    const { showWhen, conditions } = field.conditionalLogic;
    
    const conditionResults = conditions.map(condition => {
      const fieldValue = responses[condition.fieldId];
      
      if (!fieldValue && fieldValue !== 0) return false;
      
      switch (condition.condition) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        case 'not_contains':
          return !String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        default:
          return false;
      }
    });

    return showWhen === 'all' 
      ? conditionResults.every(result => result)
      : conditionResults.some(result => result);
  };

  const handleInputChange = (fieldId, value) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const renderField = (field) => {
    const value = responses[field.airtableFieldId] || '';

    switch (field.fieldType) {
      case 'singleLineText':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.airtableFieldId, e.target.value)}
            className="input"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );

      case 'multilineText':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.airtableFieldId, e.target.value)}
            className="input"
            rows={4}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );

      case 'singleSelect':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.airtableFieldId, e.target.value)}
            className="input"
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options.map(option => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        );

      case 'multipleSelect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options.map(option => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.name)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.name]
                      : selectedValues.filter(v => v !== option.name);
                    handleInputChange(field.airtableFieldId, newValues);
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{option.name}</span>
              </label>
            ))}
          </div>
        );

      case 'attachment':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg text-gray-500 text-sm">
            Unsupported field type: {field.fieldType}
          </div>
        );
    }
  };

  const visibleFields = fields
    .sort((a, b) => a.order - b.order)
    .filter(isFieldVisible);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-primary-600">
        <Eye size={20} />
        <span className="font-medium">Form Preview</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl">
        {/* Form Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {title || 'Untitled Form'}
          </h1>
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}
        </div>

        {/* Form Fields */}
        {visibleFields.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No fields configured yet</p>
            <p className="text-sm">Add fields to see the preview</p>
          </div>
        ) : (
          <div className="space-y-6">
            {visibleFields.map((field, index) => (
              <div key={field.airtableFieldId} className="form-group">
                <label className="label">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                
                {/* Show conditional logic info */}
                {field.conditionalLogic.enabled && field.conditionalLogic.conditions.length > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚡ This field has conditional logic
                  </p>
                )}
              </div>
            ))}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="button"
                className="btn-primary w-full"
                disabled
              >
                Submit Form (Preview Mode)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Preview Information</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• This is how your form will appear to users</li>
          <li>• Try changing values to test conditional logic</li>
          <li>• Fields with conditional logic are marked with ⚡</li>
          <li>• Required fields are marked with *</li>
        </ul>
      </div>
    </div>
  );
};

export default FormPreview;
