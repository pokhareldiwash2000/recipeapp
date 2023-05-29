// models/Mail.js

const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  replied: {
    type: Boolean,
    default: false
  },
  replyMessage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Mail = mongoose.model('Mail', mailSchema);

module.exports = Mail;
