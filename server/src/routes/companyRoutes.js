const express = require('express');
const router = express.Router();
const CompanyController = require('../controllers/companyController');
const { authenticateUser, checkUserRole } = require('../middleware/auth');

// GET /api/companies
router.get('/', authenticateUser, checkUserRole, CompanyController.getAll);

// GET /api/companies/:id
router.get('/:id', authenticateUser, checkUserRole, CompanyController.getById);

// POST /api/companies
router.post('/', authenticateUser, checkUserRole, CompanyController.create);

// PUT /api/companies/:id
router.put('/:id', authenticateUser, checkUserRole, CompanyController.update);

// DELETE /api/companies/:id
router.delete('/:id', authenticateUser, checkUserRole, CompanyController.delete);

// GET /api/companies/:companyId/users
router.get('/:companyId/users', authenticateUser, checkUserRole, CompanyController.getUsers);

module.exports = router; 