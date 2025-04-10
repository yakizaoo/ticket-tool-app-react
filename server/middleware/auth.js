const db = require('../config/database');

// Middleware для проверки user-id
const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Требуется аутентификация' });
  }
  req.userId = parseInt(userId);
  next();
};

// Middleware для проверки роли пользователя
const checkUserRole = async (req, res, next) => {
  try {
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [req.userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Middleware для проверки прав на удаление пользователя
const checkUserDeletePermission = (req, res, next) => {
  const currentUser = req.user;
  const targetUserId = parseInt(req.params.id);

  // Tech admin не может удалять пользователей
  if (currentUser.role === 'tech_admin') {
    return res.status(403).json({ error: 'Forbidden: Tech admin cannot delete users' });
  }

  db.get(`
    SELECT role, company_id 
    FROM users 
    WHERE id = ?
  `, [targetUserId], (err, targetUser) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Owner может удалить любого пользователя
    if (currentUser.role === 'owner') {
      return next();
    }

    // Admin может удалить пользователей только в своей компании
    if (currentUser.role === 'admin') {
      if (currentUser.company_id !== targetUser.company_id) {
        return res.status(403).json({ error: 'Forbidden: Cannot delete user from another company' });
      }
      return next();
    }

    res.status(403).json({ error: 'Forbidden: Insufficient permissions to delete user' });
  });
};

module.exports = {
  authenticateUser,
  checkUserRole,
  checkUserDeletePermission
}; 