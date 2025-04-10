const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateUser, checkUserRole, checkUserDeletePermission } = require('../middleware/auth');

// GET /api/users
router.get('/', authenticateUser, checkUserRole, UserController.getAll);

// GET /api/users/:id
router.get('/:id', authenticateUser, checkUserRole, UserController.getById);

// POST /api/users
router.post('/', authenticateUser, checkUserRole, UserController.create);

// DELETE /api/users/:id
router.delete('/:id', authenticateUser, checkUserRole, checkUserDeletePermission, UserController.delete);

// PUT /api/users/profile
router.put('/profile', authenticateUser, UserController.updateProfile);

// PUT /api/users/:id
router.put('/:id', authenticateUser, checkUserRole, UserController.updateById);

// Удаляем устаревшие маршруты, которые могут конфликтовать
// router.post('/:id/activate', authenticateUser, checkUserRole, UserController.activateUser);
// router.post('/:id/deactivate', authenticateUser, checkUserRole, UserController.deactivateUser);

module.exports = router; 