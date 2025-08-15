import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { airtableService } from '../services/airtableService';
import { formService } from '../services/formService';
import toast from 'react-hot-toast';
import BaseSelector from '../components/BaseSelector';
import TableSelector from '../components/TableSelector';
import FieldSelector from '../components/FieldSelector';
import FormPreview from '../components/FormPreview';
import { Save, Eye, ArrowLeft } from 'lucide-react';

const FormBuilderPage = () => {
  const navigate = useNavigate();
  const { formId } = useParams();
  const isEditing = !!formId;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form data state
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      title: '',
      description: ''
    }
  });

  const formTitle = watch('title');
  const formDescription = watch('description');

  useEffect(() => {
    if (isEditing) {
      loadExistingForm();
    }
  }, [formId, isEditing]);

  const loadExistingForm = async () => {
    try {
      setLoading(true);
      console.log('Loading existing form with ID:', formId);

      const response = await formService.getForm(formId);
      console.log('Form response:', response);

      if (!response || !response.form) {
        throw new Error('Invalid response format from server');
      }

      const { form } = response;

      // Validate required form data
      if (!form.airtableBaseId || !form.airtableTableId) {
        throw new Error('Form is missing Airtable configuration');
      }

      // Set form basic info
      setValue('title', form.title);
      setValue('description', form.description || '');

      // Set selected base and table info
      setSelectedBase({
        id: form.airtableBaseId,
        name: form.airtableBaseName
      });

      setSelectedTable({
        id: form.airtableTableId,
        name: form.airtableTableName
      });

      // Load available fields and set selected fields
      console.log('Loading table fields for base:', form.airtableBaseId, 'table:', form.airtableTableId);
      const { fields } = await airtableService.getTableFields(
        form.airtableBaseId,
        form.airtableTableId
      );
      setAvailableFields(fields);
      setSelectedFields(form.fields || []);

      setCurrentStep(4); // Go to field configuration step
      toast.success('Form loaded successfully');
    } catch (error) {
      console.error('Error loading form:', error);
      toast.error(`Failed to load form: ${error.message}`);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleBaseSelect = (base) => {
    try {
      console.log('Handling base selection:', base);
      setSelectedBase(base);
      setSelectedTable(null);
      setAvailableFields([]);
      setSelectedFields([]);
      setCurrentStep(3);
      toast.success(`Selected base: ${base.name}`);
    } catch (error) {
      console.error('Error in handleBaseSelect:', error);
      toast.error('Failed to select base');
    }
  };

  const handleTableSelect = async (table) => {
    try {
      setLoading(true);
      setSelectedTable(table);

      // Load fields for the selected table
      const { fields } = await airtableService.getTableFields(selectedBase.id, table.id);
      setAvailableFields(fields);
      setSelectedFields([]);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error loading table fields:', error);
      toast.error('Failed to load table fields');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldsUpdate = (fields) => {
    setSelectedFields(fields);
  };

  const onSubmit = async (data) => {
    if (!selectedBase || !selectedTable || selectedFields.length === 0) {
      let missingSteps = [];
      if (!selectedBase) missingSteps.push('Select a base');
      if (!selectedTable) missingSteps.push('Select a table');
      if (selectedFields.length === 0) missingSteps.push('Select at least one field');

      toast.error(`Please complete all steps before saving. Missing: ${missingSteps.join(', ')}`);
      return;
    }

    try {
      setSaving(true);
      
      const formData = {
        title: data.title,
        description: data.description,
        airtableBaseId: selectedBase.id,
        airtableBaseName: selectedBase.name,
        airtableTableId: selectedTable.id,
        airtableTableName: selectedTable.name,
        fields: selectedFields
      };

      if (isEditing) {
        await formService.updateForm(formId, formData);
        toast.success('Form updated successfully!');
      } else {
        await formService.createForm(formData);
        toast.success('Form created successfully!');
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Form title and description' },
    { number: 2, title: 'Select Base', description: 'Choose your Airtable base' },
    { number: 3, title: 'Select Table', description: 'Choose the target table' },
    { number: 4, title: 'Configure Fields', description: 'Select and configure form fields' },
    { number: 5, title: 'Preview', description: 'Review your form' }
  ];

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
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Form' : 'Create New Form'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing ? 'Update your form configuration' : 'Build a custom form connected to your Airtable data'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.number
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.number}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="card">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Form Information</h2>
                    
                    <div className="form-group">
                      <label className="label">Form Title *</label>
                      <input
                        {...register('title', { required: 'Form title is required' })}
                        className="input"
                        placeholder="Enter form title"
                      />
                      {errors.title && (
                        <p className="error-text">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="label">Description (Optional)</label>
                      <textarea
                        {...register('description')}
                        className="input"
                        rows={3}
                        placeholder="Describe what this form is for"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="btn-primary"
                        disabled={!formTitle}
                      >
                        Next: Select Base
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Base Selection */}
                {currentStep === 2 && (
                  <BaseSelector
                    onBaseSelect={handleBaseSelect}
                    selectedBase={selectedBase}
                    onBack={() => setCurrentStep(1)}
                  />
                )}

                {/* Step 3: Table Selection */}
                {currentStep === 3 && selectedBase && (
                  <TableSelector
                    baseId={selectedBase.id}
                    onTableSelect={handleTableSelect}
                    selectedTable={selectedTable}
                    onBack={() => setCurrentStep(2)}
                  />
                )}

                {/* Step 4: Field Configuration */}
                {currentStep === 4 && selectedTable && (
                  <FieldSelector
                    availableFields={availableFields}
                    selectedFields={selectedFields}
                    onFieldsUpdate={handleFieldsUpdate}
                    onBack={() => setCurrentStep(3)}
                    onNext={() => setCurrentStep(5)}
                  />
                )}

                {/* Step 5: Preview */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Form Preview</h2>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="btn-secondary"
                      >
                        Back to Edit
                      </button>
                    </div>
                    
                    <FormPreview
                      title={formTitle}
                      description={formDescription}
                      fields={selectedFields}
                    />

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="btn-secondary"
                      >
                        Back to Edit
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save size={16} />
                        )}
                        <span>{isEditing ? 'Update Form' : 'Create Form'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Form Info Card */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Form Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Title:</span>
                    <p className="text-gray-600">{formTitle || 'Not set'}</p>
                  </div>
                  {selectedBase && (
                    <div>
                      <span className="font-medium text-gray-700">Base:</span>
                      <p className="text-gray-600">{selectedBase.name}</p>
                    </div>
                  )}
                  {selectedTable && (
                    <div>
                      <span className="font-medium text-gray-700">Table:</span>
                      <p className="text-gray-600">{selectedTable.name}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Fields:</span>
                    <p className="text-gray-600">{selectedFields.length} selected</p>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="card bg-blue-50 border-blue-200">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Follow the steps to create your form. You can always come back and edit later.
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Choose descriptive field labels</li>
                  <li>• Use conditional logic for smart forms</li>
                  <li>• Preview before saving</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormBuilderPage;
