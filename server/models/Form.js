const mongoose = require('mongoose');

const conditionalLogicSchema = new mongoose.Schema({
  fieldId: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['equals', 'not_equals', 'contains', 'not_contains'],
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

const formFieldSchema = new mongoose.Schema({
  airtableFieldId: {
    type: String,
    required: true
  },
  airtableFieldName: {
    type: String,
    required: true
  },
  fieldType: {
    type: String,
    enum: ['singleLineText', 'multilineText', 'singleSelect', 'multipleSelect', 'attachment'],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  },
  options: [{
    id: String,
    name: String,
    color: String
  }],
  conditionalLogic: {
    enabled: {
      type: Boolean,
      default: false
    },
    showWhen: {
      type: String,
      enum: ['all', 'any'],
      default: 'all'
    },
    conditions: [conditionalLogicSchema]
  }
});

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  airtableBaseId: {
    type: String,
    required: true
  },
  airtableBaseName: {
    type: String,
    required: true
  },
  airtableTableId: {
    type: String,
    required: true
  },
  airtableTableName: {
    type: String,
    required: true
  },
  fields: [formFieldSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  submissionCount: {
    type: Number,
    default: 0
  },
  settings: {
    allowMultipleSubmissions: {
      type: Boolean,
      default: true
    },
    requireLogin: {
      type: Boolean,
      default: false
    },
    showProgressBar: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
formSchema.index({ userId: 1 });
formSchema.index({ airtableBaseId: 1, airtableTableId: 1 });
formSchema.index({ isActive: 1 });

// Virtual for form URL
formSchema.virtual('formUrl').get(function() {
  return `/form/${this._id}`;
});

// Method to increment submission count
formSchema.methods.incrementSubmissionCount = function() {
  this.submissionCount += 1;
  return this.save();
};

module.exports = mongoose.model('Form', formSchema);
