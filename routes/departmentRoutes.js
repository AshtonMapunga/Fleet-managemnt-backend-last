const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

router.post('/addDepartment', departmentController.createDepartment);
router.get('/all-departments', departmentController.getAllDepartments);
router.put('/updateBudget', departmentController.updateDepartmentBudget);
router.get('/getBudget', departmentController.getDepartmentBudget);
router.put('/editDepartment', departmentController.editDepartment);
router.put('/deductFunds', departmentController.deductFunds);

module.exports = router;