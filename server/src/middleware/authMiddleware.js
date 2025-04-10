const { getRow } = require('../config/database');

/**
 * Middleware для проверки аутентификации пользователя
 * Проверяет наличие user-id в заголовках запроса
 * 
 * @param {Object} req - Express request объект
 * @param {Object} res - Express response объект
 * @param {Function} next - Express next функция
 */
const authMiddleware = async (req, res, next) => {
  const userId = req.headers['user-id'];
  
  if (!userId || isNaN(parseInt(userId))) {
    return res.status(401).json({ error: 'Требуется аутентификация' });
  }

  try {
    // Получаем информацию о пользователе из базы данных
    const user = await getRow('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Добавляем пользователя в объект запроса
    req.user = {
      id: user.id,
      role: user.role,
      company_id: user.company_id,
      email: user.email,
      full_name: user.full_name
    };

    next();
  } catch (err) {
    console.error('Ошибка при аутентификации пользователя:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = authMiddleware; 