const { db, runQuery, getRow, getRows } = require('../config/database');
const User = require('../models/user');

/**
 * Middleware для проверки аутентификации пользователя
 * Проверяет наличие user-id в заголовках запроса
 * 
 * @param {Object} req - Express request объект
 * @param {Object} res - Express response объект
 * @param {Function} next - Express next функция
 */
const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id'];
  
  if (!userId || isNaN(parseInt(userId))) {
    return res.status(401).json({ error: 'Требуется аутентификация' });
  }

  req.userId = parseInt(userId);
  next();
};

/**
 * Middleware для проверки роли пользователя
 * Проверяет, имеет ли пользователь необходимую роль
 * 
 * @param {string} requiredRole - Требуемая роль пользователя
 * @returns {Function} Middleware функция
 */
const checkUserRole = async (req, res, next) => {
  console.log('=== checkUserRole Middleware ===');
  console.log('Headers:', req.headers);
  console.log('User ID from headers:', req.headers['user-id']);
  console.log('User ID from request:', req.userId);
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  
  const userId = req.userId || req.headers['user-id'];
  
  if (!userId) {
    console.log('No user ID provided');
    return res.status(401).json({ error: 'Требуется аутентификация' });
  }

  try {
    console.log('Checking user role for userId:', userId);
    const user = await getRow('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    console.log('User found:', {
      id: user.id,
      role: user.role,
      company_id: user.company_id,
      email: user.email,
      is_active: user.is_active
    });

    // Проверяем, что учетная запись активна
    if (user.is_active === 0) {
      console.log('User account is deactivated:', userId);
      return res.status(403).json({ error: 'Доступ запрещен (учетная запись деактивирована)' });
    }

    // Проверяем роль пользователя
    const validRoles = ['owner', 'admin', 'tech_admin', 'user'];
    if (!validRoles.includes(user.role)) {
      console.log('Invalid user role:', user.role);
      return res.status(403).json({ error: 'Недопустимая роль пользователя' });
    }

    // Добавляем пользователя в объект запроса
    req.user = {
      id: user.id,
      role: user.role,
      company_id: user.company_id,
      email: user.email,
      is_active: user.is_active
    };

    console.log('User object added to request:', req.user);
    console.log('===========================');
    next();
  } catch (err) {
    console.error('Ошибка при проверке роли пользователя:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Middleware для проверки прав на удаление пользователя
 * Проверяет, может ли текущий пользователь удалить указанного пользователя
 * 
 * @param {Object} req - Express request объект
 * @param {Object} res - Express response объект
 * @param {Function} next - Express next функция
 */
const checkUserDeletePermission = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const targetUser = await User.getById(userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Владелец может удалять любых пользователей
    if (req.user.role === 'owner') {
      return next();
    }

    // Пользователь не может удалять других пользователей
    if (req.user.role === 'user') {
      return res.status(403).json({ error: 'Пользователь не может удалять других пользователей' });
    }

    // Tech Admin может удалять только пользователей с ролью user в своей компании
    if (req.user.role === 'tech_admin') {
      if (targetUser.role !== 'user' || req.user.company_id !== targetUser.company_id) {
        return res.status(403).json({ error: 'Tech Admin может удалять только пользователей с ролью user в своей компании' });
      }
      return next();
    }

    // Админ может удалять пользователей только в своей компании и не может удалять владельцев
    if (req.user.role === 'admin') {
      if (targetUser.role === 'owner' || req.user.company_id !== targetUser.company_id) {
        return res.status(403).json({ error: 'Forbidden: Cannot delete user from another company' });
      }
      return next();
    }

    next();
  } catch (error) {
    console.error('Error in checkUserDeletePermission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  authenticateUser,
  checkUserRole,
  checkUserDeletePermission
}; 