// Utility functions for handling conditional logic

export const evaluateCondition = (condition, fieldValue) => {
  if (!fieldValue && fieldValue !== 0) return false;
  
  const { condition: conditionType, value: conditionValue } = condition;
  
  switch (conditionType) {
    case 'equals':
      return fieldValue === conditionValue;
    case 'not_equals':
      return fieldValue !== conditionValue;
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
    case 'not_contains':
      return !String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
    default:
      return false;
  }
};

export const evaluateFieldVisibility = (field, formValues) => {
  if (!field.conditionalLogic.enabled || field.conditionalLogic.conditions.length === 0) {
    return true;
  }

  const { showWhen, conditions } = field.conditionalLogic;
  
  const conditionResults = conditions.map(condition => {
    const fieldValue = formValues[condition.fieldId];
    return evaluateCondition(condition, fieldValue);
  });

  return showWhen === 'all' 
    ? conditionResults.every(result => result)
    : conditionResults.some(result => result);
};

export const getVisibleFields = (fields, formValues) => {
  return fields
    .sort((a, b) => a.order - b.order)
    .filter(field => evaluateFieldVisibility(field, formValues));
};

export const validateConditionalLogic = (field, availableFields) => {
  if (!field.conditionalLogic.enabled) return { isValid: true, errors: [] };
  
  const errors = [];
  
  // Check if there are any conditions
  if (field.conditionalLogic.conditions.length === 0) {
    errors.push('At least one condition is required when conditional logic is enabled');
  }
  
  // Validate each condition
  field.conditionalLogic.conditions.forEach((condition, index) => {
    if (!condition.fieldId) {
      errors.push(`Condition ${index + 1}: Field is required`);
    }
    
    if (!condition.value && condition.value !== 0) {
      errors.push(`Condition ${index + 1}: Value is required`);
    }
    
    // Check if the referenced field exists and comes before this field
    const referencedField = availableFields.find(f => f.airtableFieldId === condition.fieldId);
    if (referencedField && referencedField.order >= field.order) {
      errors.push(`Condition ${index + 1}: Referenced field must come before this field`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
