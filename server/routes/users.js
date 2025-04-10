const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db/db');
const { authenticateToken } = require('../middleware/auth');

// Обновление профиля пользователя
router.put('/profile', authenticateToken, async (req, res) => {
  const { full_name, email, current_password, new_password } = req.body;
  const userId = req.user.id;

  try {
    // Проверяем, существует ли пользователь
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Если меняется email, проверяем, не занят ли он
    if (email !== user.email) {
      const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existingUser) {
        return res.status(400).json({ message: 'Этот email уже используется' });
      }
    }

    // Если меняется пароль, проверяем текущий пароль
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ message: 'Необходимо указать текущий пароль' });
      }

      const validPassword = await bcrypt.compare(current_password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Неверный текущий пароль' });
      }

      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(new_password, 10);
      await pool.query(
        'UPDATE users SET full_name = ?, email = ?, password = ? WHERE id = ?',
        [full_name, email, hashedPassword, userId]
      );
    } else {
      // Если пароль не меняется, обновляем только имя и email
      await pool.query(
        'UPDATE users SET full_name = ?, email = ? WHERE id = ?',
        [full_name, email, userId]
      );
    }

    // Получаем обновленные данные пользователя
    const [updatedUser] = await pool.query(
      `SELECT u.*, c.name as company_name 
       FROM users u 
       LEFT JOIN companies c ON u.company_id = c.id 
       WHERE u.id = ?`,
      [userId]
    );

    // Удаляем пароль из ответа
    delete updatedUser.password;

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

module.exports = router; 