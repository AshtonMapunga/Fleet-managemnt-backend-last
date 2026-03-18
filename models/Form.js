const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Form title is required']
  },
  type: {
    type: String,
    enum: ['trip_request', 'leave_request', 'vehicle_request', 'fuel_request', 'maintenance_request', 'other'],
    required: [true, 'Form type is required']
  },
  fields: [{
    label: String,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'checkbox', 'radio', 'textarea']
    },
    options: [String],
    required: Boolean,
    placeholder: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const formResponseSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  responses: [{
    field: String,
    value: mongoose.Schema.Types.Mixed
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  comments: String
}, {
  timestamps: true
});

module.exports = {
  Form: mongoose.model('Form', formSchema),
  FormResponse: mongoose.model('FormResponse', formResponseSchema)
};
