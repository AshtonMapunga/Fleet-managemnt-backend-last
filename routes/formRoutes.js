const express = require('express');
const router = express.Router();
const {
  createForm,
  getForms,
  getFormById,
  updateForm,
  deleteForm,
  submitFormResponse,
  getFormResponses,
  updateResponseStatus
} = require('../controllers/formController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Forms
 *   description: Form and form response management endpoints
 */

// All routes require authentication
router.use(protect);

// ========== FORM TEMPLATE ROUTES ==========

/**
 * @swagger
 * /api/forms:
 *   post:
 *     summary: Create a new form template (Admin only)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - fields
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Vehicle Request Form"
 *               type:
 *                 type: string
 *                 enum: [trip_request, leave_request, vehicle_request, fuel_request, maintenance_request, other]
 *               description:
 *                 type: string
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: "Driver Name"
 *                     type:
 *                       type: string
 *                       enum: [text, number, date, select, checkbox, radio, textarea]
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Option 1", "Option 2"]
 *                     required:
 *                       type: boolean
 *                     placeholder:
 *                       type: string
 *               department:
 *                 type: string
 *                 description: Department ID
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *                 default: active
 *     responses:
 *       201:
 *         description: Form created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Admin access required
 */
router.route('/')
  .post(admin, createForm)
  /**
   * @swagger
   * /api/forms:
   *   get:
   *     summary: Get all form templates
   *     tags: [Forms]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of form templates
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  .get(getForms);

/**
 * @swagger
 * /api/forms/{id}:
 *   get:
 *     summary: Get form template by ID
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     responses:
 *       200:
 *         description: Form template details
 *       404:
 *         description: Form not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     summary: Update form template (Admin only)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Form updated
 *       404:
 *         description: Form not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Admin access required
 *   delete:
 *     summary: Delete form template (Admin only)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form deleted
 *       404:
 *         description: Form not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Admin access required
 */
router.route('/:id')
  .get(getFormById)
  .put(admin, updateForm)
  .delete(admin, deleteForm);

// ========== FORM RESPONSE ROUTES ==========

/**
 * @swagger
 * /api/forms/{formId}/responses:
 *   post:
 *     summary: Submit a form response
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - responses
 *             properties:
 *               responses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                     value:
 *                       type: string
 *     responses:
 *       201:
 *         description: Response submitted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   get:
 *     summary: Get all responses for a form
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     responses:
 *       200:
 *         description: List of form responses
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.route('/:formId/responses')
  .post(submitFormResponse)
  .get(getFormResponses);

/**
 * @swagger
 * /api/forms/responses/{responseId}/status:
 *   put:
 *     summary: Update response status (approve/reject)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Response ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Response status updated
 *       404:
 *         description: Response not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/responses/:responseId/status', updateResponseStatus);

module.exports = router;
