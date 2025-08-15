const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  airtableId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Allow multiple null values
  },
  name: {
    type: String,
    required: false
  },
  airtableAccessToken: {
    type: String,
    required: true
  },
  airtableRefreshToken: {
    type: String
  },
  tokenExpiresAt: {
    type: Date
  },
  profilePicture: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes are automatically created by unique: true in schema definition
// No need for explicit index creation since airtableId and email are already unique

// Method to check if token needs refresh
userSchema.methods.isTokenExpired = function() {
  return this.tokenExpiresAt && new Date() >= this.tokenExpiresAt;
};

// Method to update access token
userSchema.methods.updateAccessToken = function(accessToken, expiresIn) {
  this.airtableAccessToken = accessToken;
  this.tokenExpiresAt = new Date(Date.now() + (expiresIn * 1000));
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
