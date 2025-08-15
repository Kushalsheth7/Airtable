import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { formService } from '../services/formService';
import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, Upload } from 'lucide-react';

const FormViewerPage = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState({});

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();

  // Watch all form values for conditional logic
  const watchedValues = watch();

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      const { form } = await formService.getForm(formId);
      setForm(form);
    } catch (error) {
      console.error('Error loading form:', error);
      toast.error('Form not found or no longer available');
    } finally {
      setLoading(false);
    }
  };

  // Evaluate conditional logic
  const isFieldVisible = (field) => {
    if (!field.conditionalLogic.enabled || field.conditionalLogic.conditions.length === 0) {
      return true;
    }

    const { showWhen, conditions } = field.conditionalLogic;
    
    const conditionResults = conditions.map(condition => {
      const fieldValue = watchedValues[condition.fieldId];
      
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

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      // Filter out hidden fields and prepare responses
      const visibleFields = form.fields.filter(isFieldVisible);
      const responses = {};
      
      visibleFields.forEach(field => {
        const value = data[field.airtableFieldId];
        if (value !== undefined && value !== '') {
          responses[field.airtableFieldId] = value;
        }
      });

      await formService.submitForm(formId, responses);
      setSubmitted(true);
      toast.success('Form submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const fieldName = field.airtableFieldId;
    const isRequired = field.required;

    switch (field.fieldType) {
      case 'singleLineText':
        return (
          <input
            {...register(fieldName, { 
              required: isRequired ? `${field.label} is required` : false 
            })}
            type="text"
            className="input"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'multilineText':
        return (
          <textarea
            {...register(fieldName, { 
              required: isRequired ? `${field.label} is required` : false 
            })}
            className="input"
            rows={4}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'singleSelect':
        return (
          <select
            {...register(fieldName, { 
              required: isRequired ? `${field.label} is required` : false 
            })}
            className="input"
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
        return (
          <div className="space-y-2">
            {field.options.map(option => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  {...register(fieldName, { 
                    required: isRequired ? `${field.label} is required` : false 
                  })}
                  type="checkbox"
                  value={option.name}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{option.name}</span>
              </label>
            ))}
          </div>
        );

      case 'attachment':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-gray-500">
              <p className="text-sm">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
            </div>
            <input
              {...register(fieldName, { 
                required: isRequired ? `${field.label} is required` : false 
              })}
              type="file"
              className="hidden"
              accept="image/*,.pdf"
            />
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600">
            The form you're looking for doesn't exist or is no longer available.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your form has been submitted successfully. Your response has been saved to Airtable.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  const visibleFields = form.fields
    .sort((a, b) => a.order - b.order)
    .filter(isFieldVisible);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-gray-600 text-lg">
                {form.description}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {visibleFields.map((field) => (
              <div key={field.airtableFieldId} className="form-group">
                <label className="label">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.airtableFieldId] && (
                  <p className="error-text">
                    {errors[field.airtableFieldId].message}
                  </p>
                )}
              </div>
            ))}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-3 text-lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Form</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Powered by{' '}
              <a href="/" className="text-primary-600 hover:text-primary-500">
                Airtable Forms
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormViewerPage;
