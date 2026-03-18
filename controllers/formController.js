const { Form, FormResponse } = require('../models/Form');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// ========== FORM MANAGEMENT ==========

// @desc    Create a new form template
// @route   POST /api/forms
// @access  Private/Admin
const createForm = asyncHandler(async (req, res) => {
  try {
    const form = await Form.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: form
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get all form templates
// @route   GET /api/forms
// @access  Private
const getForms = asyncHandler(async (req, res) => {
  const forms = await Form.find()
    .populate('department', 'name')
    .populate('createdBy', 'firstName lastName');
  res.json({
    success: true,
    count: forms.length,
    data: forms
  });
});

// @desc    Get form by ID
// @route   GET /api/forms/:id
// @access  Private
const getFormById = asyncHandler(async (req, res) => {
  const form = await Form.findById(req.params.id)
    .populate('department', 'name')
    .populate('createdBy', 'firstName lastName');
  
  if (!form) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Form not found'
    });
  }
  
  res.json({
    success: true,
    data: form
  });
});

// @desc    Update form
// @route   PUT /api/forms/:id
// @access  Private/Admin
const updateForm = asyncHandler(async (req, res) => {
  const form = await Form.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!form) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Form not found'
    });
  }
  
  res.json({
    success: true,
    data: form
  });
});

// @desc    Delete form
// @route   DELETE /api/forms/:id
// @access  Private/Admin
const deleteForm = asyncHandler(async (req, res) => {
  const form = await Form.findByIdAndDelete(req.params.id);
  
  if (!form) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Form not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Form deleted successfully'
  });
});

// ========== FORM RESPONSES ==========

// @desc    Submit form response
// @route   POST /api/forms/:formId/responses
// @access  Private
const submitFormResponse = asyncHandler(async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    const response = await FormResponse.create({
      form: req.params.formId,
      responses: req.body.responses,
      submittedBy: req.user._id
    });
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get responses for a form
// @route   GET /api/forms/:formId/responses
// @access  Private
const getFormResponses = asyncHandler(async (req, res) => {
  const responses = await FormResponse.find({ form: req.params.formId })
    .populate('submittedBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName');
  
  res.json({
    success: true,
    count: responses.length,
    data: responses
  });
});

// @desc    Approve/reject form response
// @route   PUT /api/forms/responses/:responseId/status
// @access  Private/Admin
const updateResponseStatus = asyncHandler(async (req, res) => {
  const { status, comments } = req.body;
  const response = await FormResponse.findByIdAndUpdate(
    req.params.responseId,
    {
      status,
      comments,
      approvedBy: req.user._id,
      approvalDate: Date.now()
    },
    { new: true, runValidators: true }
  );
  
  if (!response) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Response not found'
    });
  }
  
  res.json({
    success: true,
    data: response
  });
});

module.exports = {
  createForm,
  getForms,
  getFormById,
  updateForm,
  deleteForm,
  submitFormResponse,
  getFormResponses,
  updateResponseStatus
};
