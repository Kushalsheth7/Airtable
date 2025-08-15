import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const FieldConfigModal = ({ field, availableFields, onSave, onClose }) => {
  const [config, setConfig] = useState({
    label: field.label,
    required: field.required,
    conditionalLogic: {
      enabled: field.conditionalLogic.enabled,
      showWhen: field.conditionalLogic.showWhen,
      conditions: field.conditionalLogic.conditions || []
    }
  });

  // Get fields that can be used for conditional logic (fields that come before this one)
  const triggerFields = availableFields.filter(f => 
    f.order < field.order && 
    ['singleLineText', 'multilineText', 'singleSelect', 'multipleSelect'].includes(f.fieldType)
  );

  const addCondition = () => {
    setConfig(prev => ({
      ...prev,
      conditionalLogic: {
        ...prev.conditionalLogic,
        conditions: [
          ...prev.conditionalLogic.conditions,
          {
            fieldId: '',
            condition: 'equals',
            value: ''
          }
        ]
      }
    }));
  };

  const updateCondition = (index, updates) => {
    setConfig(prev => ({
      ...prev,
      conditionalLogic: {
        ...prev.conditionalLogic,
        conditions: prev.conditionalLogic.conditions.map((condition, i) =>
          i === index ? { ...condition, ...updates } : condition
        )
      }
    }));
  };

  const removeCondition = (index) => {
    setConfig(prev => ({
      ...prev,
      conditionalLogic: {
        ...prev.conditionalLogic,
        conditions: prev.conditionalLogic.conditions.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = () => {
    console.log('Saving field configuration:', config);
    const updatedField = {
      ...field,
      label: config.label,
      required: config.required,
      conditionalLogic: config.conditionalLogic
    };
    onSave(updatedField);
    onClose();
  };

  const getFieldOptions = (fieldId) => {
    const triggerField = availableFields.find(f => f.airtableFieldId === fieldId);
    return triggerField?.options || [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Configure Field: {field.airtableFieldName}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Basic Configuration */}
          <div className="space-y-6">
            <div className="form-group">
              <label className="label">Field Label</label>
              <input
                type="text"
                value={config.label}
                onChange={(e) => setConfig(prev => ({ ...prev, label: e.target.value }))}
                className="input"
                placeholder="Enter field label"
              />
              <p className="text-sm text-gray-500">
                This is what users will see as the question
              </p>
            </div>

            <div className="form-group">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.required}
                  onChange={(e) => setConfig(prev => ({ ...prev, required: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Required field</span>
              </label>
            </div>

            {/* Conditional Logic */}
            <div className="border-t pt-6">
              <div className="form-group">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.conditionalLogic.enabled}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      conditionalLogic: {
                        ...prev.conditionalLogic,
                        enabled: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable conditional logic</span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Show this field only when certain conditions are met
                </p>
              </div>

              {config.conditionalLogic.enabled && (
                <div className="space-y-4 mt-4">
                  {triggerFields.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        No fields available for conditional logic. Add fields before this one to create conditions.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="label">Show this field when</label>
                        <select
                          value={config.conditionalLogic.showWhen}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            conditionalLogic: {
                              ...prev.conditionalLogic,
                              showWhen: e.target.value
                            }
                          }))}
                          className="input"
                        >
                          <option value="all">All conditions are met</option>
                          <option value="any">Any condition is met</option>
                        </select>
                      </div>

                      {/* Conditions */}
                      <div className="space-y-3">
                        {config.conditionalLogic.conditions.map((condition, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <label className="label text-xs">Field</label>
                                <select
                                  value={condition.fieldId}
                                  onChange={(e) => updateCondition(index, { fieldId: e.target.value })}
                                  className="input text-sm"
                                >
                                  <option value="">Select field</option>
                                  {triggerFields.map(f => (
                                    <option key={f.airtableFieldId} value={f.airtableFieldId}>
                                      {f.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="label text-xs">Condition</label>
                                <select
                                  value={condition.condition}
                                  onChange={(e) => updateCondition(index, { condition: e.target.value })}
                                  className="input text-sm"
                                >
                                  <option value="equals">Equals</option>
                                  <option value="not_equals">Not equals</option>
                                  <option value="contains">Contains</option>
                                  <option value="not_contains">Not contains</option>
                                </select>
                              </div>

                              <div>
                                <label className="label text-xs">Value</label>
                                {condition.fieldId && 
                                 triggerFields.find(f => f.airtableFieldId === condition.fieldId)?.fieldType === 'singleSelect' ? (
                                  <select
                                    value={condition.value}
                                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                                    className="input text-sm"
                                  >
                                    <option value="">Select option</option>
                                    {getFieldOptions(condition.fieldId).map(option => (
                                      <option key={option.id} value={option.name}>
                                        {option.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={condition.value}
                                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                                    className="input text-sm"
                                    placeholder="Enter value"
                                  />
                                )}
                              </div>

                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={() => removeCondition(index)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                                  title="Remove condition"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addCondition}
                          className="btn-secondary flex items-center space-x-2 text-sm"
                        >
                          <Plus size={16} />
                          <span>Add Condition</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldConfigModal;
