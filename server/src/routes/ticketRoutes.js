const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/ticketController');
const DashboardController = require('../controllers/dashboardController');
const { authenticateUser, checkUserRole } = require('../middleware/auth');
const cors = require('cors');

// CORS options для конкретного маршрута
const corsOptionsDelegate = (req, callback) => {
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'user-id', 'Accept', 'Origin', 'X-Requested-With']
  };
  callback(null, corsOptions);
};

// GET /api/tickets
router.get('/', authenticateUser, checkUserRole, (req, res) => TicketController.getAll(req, res));

// GET /api/tickets/stats - используем DashboardController вместо TicketController
router.options('/stats', cors(corsOptionsDelegate));
router.get('/stats', cors(corsOptionsDelegate), authenticateUser, checkUserRole, (req, res) => DashboardController.getStats(req, res));

// GET /api/tickets/:id
router.get('/:id', authenticateUser, checkUserRole, (req, res) => TicketController.getById(req, res));

// GET /api/tickets/:id/history
router.get('/:id/history', authenticateUser, checkUserRole, (req, res) => TicketController.getHistory(req, res));

// GET /api/tickets/all
router.get('/all', authenticateUser, (req, res) => TicketController.getAll(req, res));

// POST /api/tickets
router.post('/', authenticateUser, checkUserRole, (req, res) => TicketController.create(req, res));

// PUT /api/tickets/:id
router.put('/:id', authenticateUser, checkUserRole, (req, res) => TicketController.update(req, res));

// DELETE /api/tickets/:id
router.delete('/:id', authenticateUser, checkUserRole, (req, res) => TicketController.delete(req, res));

// DELETE /api/tickets/:id/permanent
router.delete('/:id/permanent', authenticateUser, checkUserRole, (req, res) => TicketController.permanentDelete(req, res));

// PATCH /api/tickets/:id/status
router.patch('/:id/status', authenticateUser, checkUserRole, (req, res) => TicketController.updateStatus(req, res));

// GET /api/tickets/:id/comments
router.get('/:id/comments', authenticateUser, checkUserRole, (req, res) => TicketController.getComments(req, res));

// POST /api/tickets/:id/comments
router.post('/:id/comments', authenticateUser, checkUserRole, (req, res) => TicketController.addComment(req, res));

module.exports = router; 