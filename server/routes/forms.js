const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Form = require('../models/Form');
const FormSubmission = require('../models/FormSubmission');
const AirtableService = require('../services/airtableService');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createFormSchema = Joi.object({
  title: Joi.string().required().min(1).max(200),
  description: Joi.string().max(1000),
  airtableBaseId: Joi.string().required(),
  airtableBaseName: Joi.string().required(),
  airtableTableId: Joi.string().required(),
  airtableTableName: Joi.string().required(),
  fields: Joi.array().items(
    Joi.object({
      airtableFieldId: Joi.string().required(),
      airtableFieldName: Joi.string().required(),
      fieldType: Joi.string().valid('singleLineText', 'multilineText', 'singleSelect', 'multipleSelect', 'attachment').required(),
      label: Joi.string().required(),
      required: Joi.boolean().default(false),
      order: Joi.number().required(),
      options: Joi.array().items(
        Joi.object({
          id: Joi.string(),
          name: Joi.string(),
          color: Joi.string()
        })
      ),
      conditionalLogic: Joi.object({
        enabled: Joi.boolean().default(false),
        showWhen: Joi.string().valid('all', 'any').default('all'),
        conditions: Joi.array().items(
          Joi.object({
            fieldId: Joi.string().required(),
            condition: Joi.string().valid('equals', 'not_equals', 'contains', 'not_contains').required(),
            value: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.array()).required()
          })
        )
      })
    })
  ).required()
});

// Create a new form
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = createFormSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const form = new Form({
      ...value,
      userId: req.user._id
    });

    await form.save();

    res.status(201).json({
      message: 'Form created successfully',
      form: {
        id: form._id,
        title: form.title,
        description: form.description,
        formUrl: form.formUrl,
        createdAt: form.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({
      error: 'Failed to create form',
      message: error.message
    });
  }
});

// Get all forms for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const forms = await Form.find({ 
      userId: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      forms: forms.map(form => ({
        id: form._id,
        title: form.title,
        description: form.description,
        airtableBaseName: form.airtableBaseName,
        airtableTableName: form.airtableTableName,
        submissionCount: form.submissionCount,
        formUrl: form.formUrl,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({
      error: 'Failed to fetch forms',
      message: error.message
    });
  }
});

// Get a specific form by ID (for editing - requires authentication)
router.get('/:formId', authenticateToken, async (req, res) => {
  try {
    const { formId } = req.params;

    // Find form and verify ownership
    const form = await Form.findOne({
      _id: formId,
      userId: req.user._id,
      isActive: true
    });

    if (!form) {
      return res.status(404).json({
        error: 'Form not found'
      });
    }

    res.json({
      form: {
        id: form._id,
        title: form.title,
        description: form.description,
        airtableBaseId: form.airtableBaseId,
        airtableBaseName: form.airtableBaseName,
        airtableTableId: form.airtableTableId,
        airtableTableName: form.airtableTableName,
        fields: form.fields,
        settings: form.settings,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({
      error: 'Failed to fetch form',
      message: error.message
    });
  }
});

// Update a form
router.put('/:formId', authenticateToken, async (req, res) => {
  try {
    const { formId } = req.params;
    const { error, value } = createFormSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const form = await Form.findOne({
      _id: formId,
      userId: req.user._id
    });

    if (!form) {
      return res.status(404).json({
        error: 'Form not found'
      });
    }

    Object.assign(form, value);
    await form.save();

    res.json({
      message: 'Form updated successfully',
      form: {
        id: form._id,
        title: form.title,
        description: form.description,
        updatedAt: form.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({
      error: 'Failed to update form',
      message: error.message
    });
  }
});

// Delete a form (soft delete)
router.delete('/:formId', authenticateToken, async (req, res) => {
  try {
    const { formId } = req.params;
    
    const form = await Form.findOne({
      _id: formId,
      userId: req.user._id
    });

    if (!form) {
      return res.status(404).json({
        error: 'Form not found'
      });
    }

    form.isActive = false;
    await form.save();

    res.json({
      message: 'Form deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({
      error: 'Failed to delete form',
      message: error.message
    });
  }
});

// Get a specific form by ID (public access for form viewing/submission)
router.get('/:formId/public', async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);

    if (!form || !form.isActive) {
      return res.status(404).json({
        error: 'Form not found'
      });
    }

    res.json({
      form: {
        id: form._id,
        title: form.title,
        description: form.description,
        fields: form.fields,
        settings: form.settings
      }
    });
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({
      error: 'Failed to fetch form',
      message: error.message
    });
  }
});

// Submit a form
router.post('/:formId/submit', async (req, res) => {
  try {
    const { formId } = req.params;
    const { responses } = req.body;

    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({
        error: 'Invalid form responses'
      });
    }

    const form = await Form.findById(formId);
    if (!form || !form.isActive) {
      return res.status(404).json({
        error: 'Form not found'
      });
    }

    // Get the form owner's access token
    const User = require('../models/User');
    const formOwner = await User.findById(form.userId);
    if (!formOwner) {
      return res.status(500).json({
        error: 'Form owner not found'
      });
    }

    // Prepare data for Airtable
    const airtableFields = {};
    const submissionFields = [];

    for (const field of form.fields) {
      const response = responses[field.airtableFieldId];

      if (field.required && (!response || response === '')) {
        return res.status(400).json({
          error: `Field "${field.label}" is required`
        });
      }

      if (response !== undefined && response !== '') {
        airtableFields[field.airtableFieldName] = response;
        submissionFields.push({
          fieldId: field.airtableFieldId,
          fieldName: field.airtableFieldName,
          fieldType: field.fieldType,
          value: response
        });
      }
    }

    // Create record in Airtable
    const airtableService = new AirtableService(formOwner.airtableAccessToken);
    const airtableRecord = await airtableService.createRecord(
      form.airtableBaseId,
      form.airtableTableId,
      airtableFields
    );

    // Save submission to our database
    const submission = new FormSubmission({
      formId: form._id,
      airtableRecordId: airtableRecord.id,
      submitterInfo: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        submittedAt: new Date()
      },
      fields: submissionFields,
      status: 'submitted'
    });

    await submission.save();

    // Increment form submission count
    await form.incrementSubmissionCount();

    res.json({
      message: 'Form submitted successfully',
      submissionId: submission._id,
      airtableRecordId: airtableRecord.id
    });

  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({
      error: 'Failed to submit form',
      message: error.message
    });
  }
});

// Get form submissions (for form owner)
router.get('/:formId/submissions', authenticateToken, async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await Form.findOne({
      _id: formId,
      userId: req.user._id
    });

    if (!form) {
      return res.status(404).json({
        error: 'Form not found'
      });
    }

    const submissions = await FormSubmission.find({ formId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      submissions: submissions.map(sub => ({
        id: sub._id,
        airtableRecordId: sub.airtableRecordId,
        submittedAt: sub.submitterInfo.submittedAt,
        status: sub.status,
        fields: sub.fields
      }))
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      error: 'Failed to fetch submissions',
      message: error.message
    });
  }
});

module.exports = router;
