const express = require('express');
const router = express.Router();
const {
  createSubsidiary,
  getSubsidiaries,
  getSubsidiaryById
} = require('../controllers/subsidiaryController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Subsidiaries
 *   description: Subsidiary management endpoints
 */

router.use(protect);

/**
 * @swagger
 * /api/subsidiaries:
 *   post:
 *     summary: Create a new subsidiary (Admin only)
 *     tags: [Subsidiaries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Dar es Salaam Branch"
 *               code:
 *                 type: string
 *                 example: "DSM001"
 *               address:
 *                 type: string
 *                 example: "123 Main Street"
 *               city:
 *                 type: string
 *                 example: "Dar es Salaam"
 *               country:
 *                 type: string
 *                 example: "Tanzania"
 *               phone:
 *                 type: string
 *                 example: "+255712345678"
 *               email:
 *                 type: string
 *                 example: "branch@company.com"
 *               manager:
 *                 type: string
 *                 description: User ID of branch manager
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Subsidiary created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Admin access required
 */
router.route('/')
  .post(admin, createSubsidiary)
  /**
   * @swagger
   * /api/subsidiaries:
   *   get:
   *     summary: Get all subsidiaries
   *     tags: [Subsidiaries]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of subsidiaries
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  .get(getSubsidiaries);

/**
 * @swagger
 * /api/subsidiaries/{id}:
 *   get:
 *     summary: Get subsidiary by ID
 *     tags: [Subsidiaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subsidiary ID
 *     responses:
 *       200:
 *         description: Subsidiary details
 *       404:
 *         description: Subsidiary not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.route('/:id')
  .get(getSubsidiaryById);

module.exports = router;
