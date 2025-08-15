import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ArrowLeft, Plus, Settings, GripVertical, Trash2, Eye, EyeOff } from 'lucide-react';
import FieldConfigModal from './FieldConfigModal';

const FieldSelector = ({ availableFields, selectedFields, onFieldsUpdate, onBack, onNext }) => {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const getFieldIcon = (fieldType) => {
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

  const getFieldTypeName = (fieldType) => {
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

  const addField = (field) => {
    const newField = {
      airtableFieldId: field.id,
      airtableFieldName: field.name,
      fieldType: field.type,
      label: field.name,
      required: false,
      order: selectedFields.length,
      options: field.options?.choices || [],
      conditionalLogic: {
        enabled: false,
        showWhen: 'all',
        conditions: []
      }
    };

    onFieldsUpdate([...selectedFields, newField]);
  };

  const removeField = (fieldId) => {
    const updatedFields = selectedFields
      .filter(field => field.airtableFieldId !== fieldId)
      .map((field, index) => ({ ...field, order: index }));
    onFieldsUpdate(updatedFields);
  };

  const openFieldConfig = (field) => {
    setEditingField(field);
    setConfigModalOpen(true);
  };

  const updateField = (updatedField) => {
    const updatedFields = selectedFields.map(field =>
      field.airtableFieldId === updatedField.airtableFieldId ? updatedField : field
    );
    onFieldsUpdate(updatedFields);
    setConfigModalOpen(false);
    setEditingField(null);
  };

  const onDragEnd = (result) => {
    try {
      if (!result.destination) return;
      if (result.destination.index === result.source.index) return;

      const items = Array.from(selectedFields);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      // Update order property
      const updatedFields = items.map((field, index) => ({ ...field, order: index }));
      onFieldsUpdate(updatedFields);
    } catch (error) {
      console.error('Error in drag and drop:', error);
    }
  };

  const toggleFieldVisibility = (fieldId) => {
    const field = selectedFields.find(f => f.airtableFieldId === fieldId);
    if (!field) return;

    // If enabling conditional logic, open the config modal
    if (!field.conditionalLogic.enabled) {
      openFieldConfig(field);
      return;
    }

    // If disabling, just toggle it off
    const updatedFields = selectedFields.map(f => {
      if (f.airtableFieldId === fieldId) {
        return {
          ...f,
          conditionalLogic: {
            ...f.conditionalLogic,
            enabled: false,
            conditions: [] // Clear conditions when disabling
          }
        };
      }
      return f;
    });
    onFieldsUpdate(updatedFields);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Configure Form Fields</h2>
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Fields */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Fields</h3>
          <p className="text-sm text-gray-600 mb-4">
            Click on fields to add them to your form
          </p>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableFields.map((field) => {
              const isSelected = selectedFields.some(sf => sf.airtableFieldId === field.id);
              
              return (
                <button
                  type="button"
                  key={field.id}
                  onClick={() => !isSelected && addField(field)}
                  disabled={isSelected}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getFieldIcon(field.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{field.name}</h4>
                      <p className="text-sm text-gray-500">
                        {getFieldTypeName(field.type)}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Added
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Fields */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Form Fields ({selectedFields.length})
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag to reorder, click settings to configure
          </p>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="selectedFields">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {selectedFields.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No fields selected yet</p>
                      <p className="text-sm text-gray-400">Add fields from the left panel</p>
                    </div>
                  ) : (
                    selectedFields
                      .sort((a, b) => a.order - b.order)
                      .map((field, index) => (
                        <Draggable
                          key={field.airtableFieldId}
                          draggableId={field.airtableFieldId}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`p-3 bg-white border rounded-lg ${
                                snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-gray-400 hover:text-gray-600 cursor-grab"
                                >
                                  <GripVertical size={16} />
                                </div>
                                
                                <span className="text-lg">{getFieldIcon(field.fieldType)}</span>
                                
                                <div className="flex-1">
                                  <h4 className="font-medium">{field.label}</h4>
                                  <p className="text-sm text-gray-500">
                                    {getFieldTypeName(field.fieldType)}
                                    {field.required && (
                                      <span className="ml-2 text-red-500">*</span>
                                    )}
                                  </p>
                                </div>

                                <div className="flex items-center space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleFieldVisibility(field.airtableFieldId)}
                                    className={`p-1 rounded ${
                                      field.conditionalLogic.enabled
                                        ? 'text-orange-600 hover:bg-orange-100'
                                        : 'text-gray-400 hover:bg-gray-100'
                                    }`}
                                    title={field.conditionalLogic.enabled ? 'Has conditional logic' : 'No conditional logic'}
                                  >
                                    {field.conditionalLogic.enabled ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openFieldConfig(field)}
                                    className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-100 rounded"
                                    title="Configure field"
                                  >
                                    <Settings size={16} />
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => removeField(field.airtableFieldId)}
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
                                    title="Remove field"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {selectedFields.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onNext}
                className="btn-primary"
              >
                Next: Preview Form
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Field Configuration Modal */}
      {configModalOpen && editingField && (
        <FieldConfigModal
          field={editingField}
          availableFields={selectedFields}
          onSave={updateField}
          onClose={() => {
            setConfigModalOpen(false);
            setEditingField(null);
          }}
        />
      )}
    </div>
  );
};

export default FieldSelector;
