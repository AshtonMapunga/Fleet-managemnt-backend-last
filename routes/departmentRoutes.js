const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management endpoints
 */

// All routes protected
router.use(protect);

/**
 * @swagger
 * /api/departments/create:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name
 *               description:
 *                 type: string
 *                 description: Department description
 *               departmentHead:
 *                 type: string
 *                 description: Department head user ID
 *               allocatedFunds:
 *                 type: number
 *                 description: Allocated funds
 *               availableFunds:
 *                 type: number
 *                 description: Available funds
 *               subsidiary:
 *                 type: string
 *                 description: Subsidiary ID
 *     responses:
 *       201:
 *         description: Department created successfully
 */
router.post('/create', departmentController.createDepartment);

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 */
router.get('/', departmentController.getAllDepartments);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department retrieved successfully
 *       404:
 *         description: Department not found
 */
router.get('/:id', departmentController.getDepartmentById);

/**
 * @swagger
 * /api/departments/updateBudget:
 *   put:
 *     summary: Update department budget
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - budget
 *             properties:
 *               budget:
 *                 type: number
 *                 description: New budget amount
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *       404:
 *         description: Department not found
 */
router.put('/updateBudget', departmentController.updateDepartmentBudget);

/**
 * @swagger
 * /api/departments/getBudget:
 *   get:
 *     summary: Get department budget
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Budget retrieved successfully
 *       404:
 *         description: Department not found
 */
router.get('/getBudget', departmentController.getDepartmentBudget);

/**
 * @swagger
 * /api/departments/editDepartment:
 *   put:
 *     summary: Edit department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name
 *               description:
 *                 type: string
 *                 description: Department description
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       404:
 *         description: Department not found
 */
router.put('/editDepartment', departmentController.editDepartment);

/**
 * @swagger
 * /api/departments/deductFunds:
 *   put:
 *     summary: Deduct funds from department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to deduct
 *     responses:
 *       200:
 *         description: Funds deducted successfully
 *       400:
 *         description: Insufficient funds
 *       404:
 *         description: Department not found
 */
router.put('/deductFunds', departmentController.deductFunds);

module.exports = router;