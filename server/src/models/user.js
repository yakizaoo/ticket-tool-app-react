const { db, runQuery, getRow, getRows } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  /**
   * Создает нового пользователя
   * 
   * @param {Object} userData - Данные пользователя
   * @param {string} userData.email - Email пользователя
   * @param {string} userData.password - Пароль пользователя
   * @param {string} userData.full_name - Полное имя пользователя
   * @param {string} userData.role - Роль пользователя
   * @param {number} userData.company_id - ID компании
   * @returns {Promise<number>} ID созданного пользователя
   */
  static async create({ email, password, full_name, role, company_id }) {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if company exists
        const company = await getRow('SELECT id FROM companies WHERE id = ?', [company_id]);
        if (!company) {
          reject(new Error('Компания не найдена'));
          return;
        }

        // Check if email is unique
        const existingUser = await getRow('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
          reject(new Error('Пользователь с таким email уже существует'));
          return;
        }

        // Хешируем пароль перед сохранением
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed for new user:', email);

        const result = await runQuery(
          'INSERT INTO users (email, password, full_name, role, company_id) VALUES (?, ?, ?, ?, ?)',
          [email, hashedPassword, full_name, role, company_id]
        );
        resolve(result.lastID);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Получает пользователя по ID
   * 
   * @param {number} id - ID пользователя
   * @returns {Promise<Object|null>} Данные пользователя или null, если не найден
   */
  static async getById(id) {
    return getRow(`
      SELECT u.*, c.name as company_name 
      FROM users u 
      LEFT JOIN companies c ON u.company_id = c.id 
      WHERE u.id = ?
    `, [id]);
  }

  /**
   * Получает всех пользователей
   * 
   * @returns {Promise<Array>} Список всех пользователей
   */
  static async getAll() {
    return getRows(`
      SELECT u.id, u.email, u.full_name, u.role, u.company_id, u.is_active, c.name as company_name 
      FROM users u 
      LEFT JOIN companies c ON u.company_id = c.id
    `);
  }

  /**
   * Получает пользователей по компании
   * 
   * @param {number} companyId - ID компании
   * @returns {Promise<Array>} Список пользователей
   */
  static async getByCompany(companyId) {
    return getRows(`
      SELECT u.id, u.email, u.full_name, u.role, u.company_id, u.is_active, c.name as company_name 
      FROM users u 
      LEFT JOIN companies c ON u.company_id = c.id 
      WHERE u.company_id = ?
    `, [companyId]);
  }

  /**
   * Проверяет учетные данные пользователя
   * 
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<Object|null>} Данные пользователя или null, если неверные учетные данные
   */
  static async authenticate(email, password) {
    try {
      const user = await getRow('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) {
        return null;
      }

      // Проверяем, что учетная запись активна
      if (!user.is_active) {
        throw new Error('Учетная запись деактивирована');
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return null;
      }

      return user;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Удаляет пользователя
   * 
   * @param {number} id - ID пользователя
   * @returns {Promise<void>}
   */
  static async delete(id) {
    try {
      console.log('Attempting to delete user:', id);
      
      // Сначала удаляем все тикеты пользователя
      await runQuery('DELETE FROM tickets WHERE created_by = ?', [id]);
      console.log('Deleted all user tickets');

      const result = await runQuery('DELETE FROM users WHERE id = ?', [id]);
      console.log('Delete result:', result);
      if (result.changes === 0) {
        throw new Error('Пользователь не найден');
      }
      return true;
    } catch (err) {
      console.error('Error in User.delete:', err);
      throw err;
    }
  }

  /**
   * Проверяет пароль пользователя
   * 
   * @param {string} password - Введенный пароль
   * @param {string} hashedPassword - Хешированный пароль из базы данных
   * @returns {Promise<boolean>} true, если пароль верный
   */
  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Получаем пользователя по email
   * 
   * @param {string} email - Email пользователя
   * @returns {Promise<Object>} Объект пользователя
   */
  static async getByEmail(email) {
    return getRow(
      `SELECT u.*, c.name as company_name 
       FROM users u 
       LEFT JOIN companies c ON u.company_id = c.id 
       WHERE u.email = ?`,
      [email]
    );
  }

  /**
   * Обновляет данные пользователя
   * 
   * @param {number} id - ID пользователя
   * @param {Object} data - Данные для обновления
   * @returns {Promise<boolean>} - Результат операции
   */
  static async update(id, data) {
    console.log('Updating user data:', id, data);
    
    try {
      // Формируем части запроса для обновления
      const fields = [];
      const values = [];
      
      if (data.email) {
        fields.push('email = ?');
        values.push(data.email);
      }
      
      if (data.password) {
        // Хешируем пароль перед сохранением в базу
        const hashedPassword = await bcrypt.hash(data.password, 10);
        console.log('Password hashed for user update, ID:', id);
        fields.push('password = ?');
        values.push(hashedPassword);
      }
      
      if (data.full_name) {
        fields.push('full_name = ?');
        values.push(data.full_name);
      }
      
      if (data.role) {
        fields.push('role = ?');
        values.push(data.role);
      }
      
      if (data.company_id) {
        fields.push('company_id = ?');
        values.push(data.company_id);
      }

      // Обработка is_active отдельно, так как в старых версиях БД может не быть этого поля
      if (data.is_active !== undefined) {
        try {
          // Проверяем наличие столбца is_active
          const result = await getRows('PRAGMA table_info(users)');
          const hasIsActiveColumn = result.some(column => column.name === 'is_active');
          
          if (hasIsActiveColumn) {
            fields.push('is_active = ?');
            values.push(data.is_active ? 1 : 0);
            console.log('Добавлено обновление поля is_active:', data.is_active);
          } else {
            console.log('Столбец is_active не найден в таблице users, пропускаем обновление этого поля');
            // Если поля нет, но нужно активировать/деактивировать, используем соответствующие методы
            if (data.is_active === true) {
              await this.activate(id);
              console.log('Использован метод activate вместо обновления is_active');
            } else if (data.is_active === false) {
              await this.deactivate(id);
              console.log('Использован метод deactivate вместо обновления is_active');
            }
          }
        } catch (err) {
          console.error('Ошибка при проверке столбца is_active:', err);
        }
      }
      
      if (fields.length === 0) {
        console.log('No fields to update');
        return false;
      }
      
      values.push(id);
      
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      console.log('Update query:', query, 'Values:', values);
      
      const result = await runQuery(query, values);
      console.log('Update result:', result);
      
      return result.changes > 0;
    } catch (err) {
      console.error('Error in User.update:', err);
      throw err;
    }
  }

  /**
   * Деактивирует учетную запись пользователя
   * 
   * @param {number} id - ID пользователя
   * @returns {Promise<boolean>} - Результат операции
   */
  static async deactivate(id) {
    try {
      console.log(`Deactivating user with ID: ${id}`);
      
      // Проверяем существование пользователя перед деактивацией
      const user = await getRow('SELECT id, is_active FROM users WHERE id = ?', [id]);
      if (!user) {
        console.error(`User with ID ${id} not found`);
        throw new Error('Пользователь не найден');
      }
      
      // Проверяем, не деактивирован ли пользователь уже
      if (user.is_active === 0) {
        console.log(`User ${id} is already inactive`);
        return true; // Пользователь уже неактивен
      }
      
      const result = await runQuery(
        'UPDATE users SET is_active = 0 WHERE id = ?',
        [id]
      );
      
      console.log(`Deactivation result for user ${id}:`, result);
      return result.changes > 0;
    } catch (err) {
      console.error('Error deactivating user:', err);
      throw err;
    }
  }

  /**
   * Активирует учетную запись пользователя
   * 
   * @param {number} id - ID пользователя
   * @returns {Promise<boolean>} - Результат операции
   */
  static async activate(id) {
    try {
      console.log(`Activating user with ID: ${id}`);
      
      // Проверяем существование пользователя перед активацией
      const user = await getRow('SELECT id, is_active FROM users WHERE id = ?', [id]);
      if (!user) {
        console.error(`User with ID ${id} not found`);
        throw new Error('Пользователь не найден');
      }
      
      // Проверяем, не активирован ли пользователь уже
      if (user.is_active === 1) {
        console.log(`User ${id} is already active`);
        return true; // Пользователь уже активен
      }
      
      const result = await runQuery(
        'UPDATE users SET is_active = 1 WHERE id = ?',
        [id]
      );
      
      console.log(`Activation result for user ${id}:`, result);
      return result.changes > 0;
    } catch (err) {
      console.error('Error activating user:', err);
      throw err;
    }
  }
}

module.exports = User; 