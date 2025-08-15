const mongoose = require('mongoose');

const submissionFieldSchema = new mongoose.Schema({
  fieldId: {
    type: String,
    required: true
  },
  fieldName: {
    type: String,
    required: true
  },
  fieldType: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed
  }
});

const formSubmissionSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  airtableRecordId: {
    type: String,
    required: true
  },
  submitterInfo: {
    ip: String,
    userAgent: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  fields: [submissionFieldSchema],
  status: {
    type: String,
    enum: ['pending', 'submitted', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
formSubmissionSchema.index({ formId: 1 });
formSubmissionSchema.index({ airtableRecordId: 1 });
formSubmissionSchema.index({ status: 1 });
formSubmissionSchema.index({ 'submitterInfo.submittedAt': -1 });

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);
