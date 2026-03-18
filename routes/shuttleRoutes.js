const express = require('express');
const router = express.Router();
const {
  createShuttle,
  getShuttles,
  getShuttleById,
  updateShuttle,
  deleteShuttle
} = require('../controllers/shuttleController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Shuttles
 *   description: Shuttle management endpoints
 */

router.use(protect);

/**
 * @swagger
 * /api/shuttles:
 *   post:
 *     summary: Create a new shuttle
 *     tags: [Shuttles]
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
 *               - registration
 *               - capacity
 *               - route
 *             properties:
 *               name:
 *                 type: string
 *                 example: "City Express"
 *               registration:
 *                 type: string
 *                 example: "T123BUS"
 *               capacity:
 *                 type: number
 *                 example: 30
 *               driver:
 *                 type: string
 *                 description: Driver ID
 *               route:
 *                 type: string
 *                 example: "City Center - Airport"
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     departureTime:
 *                       type: string
 *                       example: "08:00"
 *                     arrivalTime:
 *                       type: string
 *                       example: "09:00"
 *                     days:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Monday", "Wednesday", "Friday"]
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance]
 *                 default: active
 *               department:
 *                 type: string
 *                 description: Department ID
 *     responses:
 *       201:
 *         description: Shuttle created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.route('/')
  .post(createShuttle)
  /**
   * @swagger
   * /api/shuttles:
   *   get:
   *     summary: Get all shuttles
   *     tags: [Shuttles]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of shuttles
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  .get(getShuttles);

/**
 * @swagger
 * /api/shuttles/{id}:
 *   get:
 *     summary: Get shuttle by ID
 *     tags: [Shuttles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shuttle ID
 *     responses:
 *       200:
 *         description: Shuttle details
 *       404:
 *         description: Shuttle not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     summary: Update shuttle
 *     tags: [Shuttles]
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
 *         description: Shuttle updated
 *       404:
 *         description: Shuttle not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     summary: Delete shuttle (Admin only)
 *     tags: [Shuttles]
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
 *         description: Shuttle deleted
 *       404:
 *         description: Shuttle not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Admin access required
 */
router.route('/:id')
  .get(getShuttleById)
  .put(updateShuttle)
  .delete(admin, deleteShuttle);

module.exports = router;
