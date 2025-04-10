const { runQuery, getRow, getRows, executeQuery } = require('../config/database');

class Ticket {
  /**
   * Создает новый тикет
   * 
   * @param {Object} ticketData - Данные тикета
   * @param {string} ticketData.title - Заголовок тикета
   * @param {string} ticketData.description - Описание тикета
   * @param {string} ticketData.category - Категория тикета
   * @param {string} ticketData.urgency - Срочность тикета
   * @param {number} ticketData.company_id - ID компании
   * @param {number} ticketData.created_by - ID создателя
   * @param {string} ticketData.comment - Комментарий к тикету
   * @param {string} ticketData.assigned_role - Роль, назначенная на тикет (admin или tech_admin)
   * @returns {Promise<Object>} Созданный тикет
   */
  static async create(ticketData) {
    console.log('=== Ticket Model: Create ===');
    console.log('Received ticket data:', ticketData);
    console.log('Validating assigned_role:', ticketData.assigned_role);

    // Проверяем роль
    const validRoles = ['admin', 'tech_admin'];
    if (ticketData.assigned_role !== undefined && ticketData.assigned_role !== null) {
      if (typeof ticketData.assigned_role !== 'string' || !validRoles.includes(ticketData.assigned_role)) {
        console.log('Invalid role detected in model:', ticketData.assigned_role);
        throw new Error('Недопустимая роль. Разрешены только admin и tech_admin');
      }
    }

    // Проверяем существование компании
    console.log('Checking company existence:', ticketData.company_id);
    const company = await getRow('SELECT id FROM companies WHERE id = ?', [ticketData.company_id]);
    if (!company) {
      console.log('Company not found:', ticketData.company_id);
      throw new Error('Компания не найдена');
    }

    // Проверяем существование создателя
    console.log('Checking creator existence:', ticketData.created_by);
    const creator = await getRow('SELECT id FROM users WHERE id = ?', [ticketData.created_by]);
    if (!creator) {
      console.log('Creator not found:', ticketData.created_by);
      throw new Error('Пользователь не найден');
    }

    console.log('All validations passed in model, creating ticket...');

    const result = await runQuery(
      'INSERT INTO tickets (title, description, category, urgency, status, company_id, created_by, comment, assigned_role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ticketData.title, ticketData.description, ticketData.category, ticketData.urgency, 'open', ticketData.company_id, ticketData.created_by, ticketData.comment, ticketData.assigned_role]
    );

    const ticket = await getRow(
      'SELECT t.*, u.email as creator_email FROM tickets t LEFT JOIN users u ON t.created_by = u.id WHERE t.id = ?',
      [result.lastID]
    );

    return ticket;
  }

  /**
   * Получает тикет по ID
   * 
   * @param {number} id - ID тикета
   * @returns {Promise<Object|null>} Данные тикета или null, если не найден
   */
  static async getById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('Getting ticket by ID:', id);
        
        // Сначала проверим существование тикета простым запросом
        const ticketExists = await getRow('SELECT id FROM tickets WHERE id = ?', [id]);
        console.log('Ticket exists check:', ticketExists);
        
        if (!ticketExists) {
          console.log('Ticket not found in database');
          resolve(null);
          return;
        }

        // Если тикет существует, получим полные данные
        const ticket = await getRow(
          `SELECT t.*, u.email as creator_email 
           FROM tickets t 
           LEFT JOIN users u ON t.created_by = u.id 
           WHERE t.id = ?`,
          [id]
        );
        console.log('Ticket found:', ticket);
        resolve(ticket || null);
      } catch (err) {
        console.error('Error getting ticket:', err);
        reject(new Error('Ошибка при получении тикета'));
      }
    });
  }

  /**
   * Получает тикеты компании с опциональной фильтрацией
   * 
   * @param {number} companyId - ID компании
   * @param {Object} filters - Фильтры
   * @param {string} [filters.status] - Фильтр по статусу
   * @param {Object} user - Информация о пользователе
   * @param {string} user.role - Роль пользователя
   * @param {number} user.company_id - ID компании пользователя
   * @returns {Promise<Array>} Список тикетов
   */
  static async getByCompany(companyId, filters = {}, user) {
    let query = `
      SELECT t.*, u.email as creator_email 
      FROM tickets t 
      LEFT JOIN users u ON t.created_by = u.id 
      WHERE t.company_id = ?
    `;
    const params = [companyId];

    // Пользователи с ролями user, tech_admin и admin не должны видеть тикеты со статусом hidden
    if (user && user.role !== 'owner') {
      query += ' AND t.status != ?';
      params.push('hidden');
    }

    if (filters.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }

    return getRows(query, params);
  }

  /**
   * Обновляет статус тикета
   * 
   * @param {number} id - ID тикета
   * @param {string} status - Новый статус
   * @param {string} comment - Комментарий к изменению
   * @param {number} userId - ID пользователя, совершившего действие
   * @returns {Promise<void>}
   */
  static async updateStatus(id, status, comment = '', userId = null) {
    return new Promise(async (resolve, reject) => {
      try {
        // Проверяем существование тикета
        const ticket = await getRow('SELECT id FROM tickets WHERE id = ?', [id]);
        if (!ticket) {
          reject(new Error('Тикет не найден'));
          return;
        }

        // Обновляем статус и комментарий
        const commentText = userId ? `${comment} (изменено пользователем ${userId})` : comment;
        const result = await runQuery(
          'UPDATE tickets SET status = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, commentText, id]
        );

        if (result.changes === 0) {
          reject(new Error('Тикет не найден'));
        } else {
          resolve();
        }
      } catch (err) {
        console.error('Error updating ticket status:', err);
        reject(new Error('Ошибка при обновлении статуса тикета'));
      }
    });
  }

  /**
   * Удаляет тикет из базы данных
   * 
   * @param {number} id - ID тикета
   * @returns {Promise<boolean>} Результат удаления
   */
  static async delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('=== Deleting Ticket ===');
        console.log('Ticket ID:', id);

        // Проверяем существование тикета
        const ticketExists = await getRow('SELECT id FROM tickets WHERE id = ?', [id]);
        console.log('Ticket exists check:', ticketExists);

        if (!ticketExists) {
          console.log('Ticket not found');
          resolve(false);
          return;
        }

        // Удаляем зависимые данные перед удалением тикета
        console.log('Deleting ticket history records...');
        await runQuery('DELETE FROM ticket_history WHERE ticket_id = ?', [id]);
        
        console.log('Deleting ticket comments...');
        await runQuery('DELETE FROM ticket_comments WHERE ticket_id = ?', [id]);
        
        // Проверяем наличие других связанных таблиц и удаляем из них записи
        // Можно добавить больше таблиц по мере необходимости
        
        console.log('Attempting to delete ticket...');
        const result = await runQuery('DELETE FROM tickets WHERE id = ?', [id]);
        console.log('Delete result:', result);

        if (result.changes > 0) {
          console.log('Ticket deleted successfully');
          resolve(true);
        } else {
          console.log('No changes made during deletion');
          resolve(false);
        }
      } catch (err) {
        console.error('Error deleting ticket:', err);
        reject(new Error('Ошибка при удалении тикета'));
      }
    });
  }

  /**
   * Получает все тикеты с опциональной фильтрацией
   * 
   * @param {Object} filters - Фильтры
   * @param {string} [filters.status] - Фильтр по статусу
   * @param {Object} user - Информация о пользователе
   * @param {string} user.role - Роль пользователя
   * @param {number} user.company_id - ID компании пользователя
   * @returns {Promise<Array>} Список тикетов
   */
  static async getAll(filters = {}, user) {
    try {
      console.log('Getting all tickets with filters:', filters);
      console.log('User info:', user);
      
      let query = `
        SELECT 
          t.*,
          c.name as company_name,
          u.email as creator_email,
          u.full_name as creator_name
        FROM tickets t
        LEFT JOIN companies c ON t.company_id = c.id
        LEFT JOIN users u ON t.created_by = u.id
      `;

      let conditions = [];
      let params = [];

      // Фильтрация по компании для всех пользователей КРОМЕ OWNER
      // Владелец (owner) видит тикеты всех компаний
      if (user.role !== 'owner') {
        conditions.push('t.company_id = ?');
        params.push(user.company_id);
      }
        
      // Пользователи с ролями user, tech_admin и admin не должны видеть тикеты со статусом hidden
      // владелец (owner) видит все тикеты, включая hidden
      if (user.role !== 'owner') {
        conditions.push('t.status != ?');
        params.push('hidden');
      }

      // Для пользователей с ролью user добавляем фильтр по created_by
      if (user.role === 'user') {
        conditions.push('t.created_by = ?');
        params.push(user.id);
      }
      
      // Добавляем фильтр по статусу, если он указан
      if (filters.status) {
        // Если пользователь owner и запрашивает тикеты со статусом hidden, не добавляем условие t.status != 'hidden'
        if (user.role === 'owner' && filters.status === 'hidden') {
          // Удаляем условие статуса hidden из массива conditions, если оно было добавлено
          const hiddenIndex = conditions.findIndex(cond => cond === 't.status != ?');
          if (hiddenIndex !== -1) {
            conditions.splice(hiddenIndex, 1);
            params.splice(hiddenIndex, 1);
          }
        }
        
        conditions.push('t.status = ?');
        params.push(filters.status);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY t.created_at DESC';
      
      console.log('SQL Query:', query);
      console.log('Query params:', params);
      
      const tickets = await getRows(query, params);
      console.log('Found tickets:', tickets.length);
      return tickets;
    } catch (err) {
      console.error('Error getting all tickets:', err);
      throw new Error('Ошибка при получении списка тикетов');
    }
  }

  /**
   * Получает тикеты пользователя
   * 
   * @param {number} userId - ID пользователя
   * @param {Object} filters - Фильтры для выборки
   * @param {string} [filters.status] - Статус тикета
   * @returns {Promise<Array>} Список тикетов
   */
  static async getByUser(userId, filters = {}) {
    try {
      console.log('Getting tickets for user:', userId, 'with filters:', filters);
      
      let query = `
        SELECT t.*, u.email as creator_email, u.full_name as creator_name, c.name as company_name
        FROM tickets t
        LEFT JOIN users u ON t.created_by = u.id
        LEFT JOIN companies c ON t.company_id = c.id
        WHERE t.created_by = ? AND t.status != 'hidden'
      `;

      const params = [userId];

      if (filters.status) {
        query += ' AND t.status = ?';
        params.push(filters.status);
      }
      
      query += ' ORDER BY t.created_at DESC';
      
      console.log('User tickets query:', query);
      console.log('Params:', params);
      
      const tickets = await getRows(query, params);
      console.log(`Found ${tickets.length} tickets for user ${userId}`);
      return tickets;
    } catch (err) {
      console.error('Error getting user tickets:', err);
      throw new Error('Ошибка при получении тикетов пользователя');
    }
  }

  static async updateExistingStatuses() {
    try {
      // Обновляем статусы существующих тикетов
      const query = `
        UPDATE tickets 
        SET status = CASE 
          WHEN status IN ('in_progress', 'resolved') THEN 'closed'
          WHEN status = 'archived' THEN 'hidden'
          ELSE status
        END
        WHERE status IN ('in_progress', 'resolved', 'archived')
      `;
      
      await runQuery(query);
      console.log('Successfully updated existing ticket statuses');
      return true;
    } catch (err) {
      console.error('Error updating ticket statuses:', err);
      // Не выбрасываем ошибку, чтобы не прерывать запуск сервера
      return false;
    }
  }

  async updateStatus(id, status, userId, comment) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Обновляем статус тикета
      const updateQuery = `
        UPDATE tickets 
        SET status = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;
      const updateResult = await client.query(updateQuery, [status, userId, id]);
      
      if (updateResult.rows.length === 0) {
        throw new Error('Тикет не найден');
      }

      // Добавляем запись в историю статусов
      const historyQuery = `
        INSERT INTO ticket_status_history 
        (ticket_id, status, changed_by, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      await client.query(historyQuery, [id, status, userId, comment]);

      await client.query('COMMIT');
      return updateResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Обновляет данные тикета
   * 
   * @param {number} id - ID тикета
   * @param {Object} data - Данные для обновления
   * @returns {Promise<Object>} Обновленный тикет
   */
  static async update(id, data) {
    try {
      console.log('Updating ticket:', { id, data });

      // Проверяем существование тикета
      const ticketExists = await getRow('SELECT id FROM tickets WHERE id = ?', [id]);
      if (!ticketExists) {
        throw new Error('Тикет не найден');
      }

      // Формируем SQL запрос для обновления
      const updateFields = [];
      const updateValues = [];

      if (data.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(data.title);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description);
      }
      if (data.category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(data.category);
      }
      if (data.urgency !== undefined) {
        updateFields.push('urgency = ?');
        updateValues.push(data.urgency);
      }
      if (data.assigned_role !== undefined) {
        updateFields.push('assigned_role = ?');
        updateValues.push(data.assigned_role);
      }
      if (data.updated_by !== undefined) {
        updateFields.push('updated_by = ?');
        updateValues.push(data.updated_by);
      }

      // Добавляем timestamp обновления
      updateFields.push('updated_at = CURRENT_TIMESTAMP');

      // Добавляем ID тикета в массив значений
      updateValues.push(id);

      // Выполняем обновление
      const query = `UPDATE tickets SET ${updateFields.join(', ')} WHERE id = ?`;
      console.log('Update query:', query);
      console.log('Update values:', updateValues);

      const result = await runQuery(query, updateValues);

      if (result.changes === 0) {
        throw new Error('Тикет не найден');
      }

      // Получаем обновленный тикет
      const updatedTicket = await getRow(
        `SELECT t.*, u.email as creator_email 
         FROM tickets t 
         LEFT JOIN users u ON t.created_by = u.id 
         WHERE t.id = ?`,
        [id]
      );

      return updatedTicket;
    } catch (err) {
      console.error('Error updating ticket:', err);
      throw err;
    }
  }

  /**
   * Получает историю изменений тикета
   * 
   * @param {number} ticketId - ID тикета
   * @returns {Promise<Array>} История изменений
   */
  static async getHistory(ticketId) {
    console.log('Getting history for ticket:', ticketId);
    
    const query = `
      SELECT 
        th.*,
        u.email as user_email,
        u.full_name as user_name
      FROM ticket_history th
      LEFT JOIN users u ON th.user_id = u.id
      WHERE th.ticket_id = ?
      ORDER BY th.created_at DESC
    `;
    
    const history = await getRows(query, [ticketId]);
    console.log('Found history records:', history);
    
    return history;
  }

  /**
   * Добавляет запись в историю изменений тикета
   * 
   * @param {Object} historyData - Данные для истории
   * @param {number} historyData.ticket_id - ID тикета
   * @param {number} historyData.user_id - ID пользователя
   * @param {string} historyData.action_type - Тип действия
   * @param {string} [historyData.old_value] - Старое значение
   * @param {string} [historyData.new_value] - Новое значение
   * @param {string} [historyData.comment] - Комментарий
   * @returns {Promise<Object>} Созданная запись истории
   */
  static async addHistoryRecord(historyData) {
    console.log('Adding history record:', historyData);
    
    const query = `
      INSERT INTO ticket_history (
        ticket_id, user_id, action_type, old_value, new_value, comment
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await runQuery(query, [
      historyData.ticket_id,
      historyData.user_id,
      historyData.action_type,
      historyData.old_value || null,
      historyData.new_value || null,
      historyData.comment || null
    ]);

    console.log('History record added:', result);

    return {
      id: result.lastID,
      ...historyData,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Получает комментарии к тикету
   * 
   * @param {number} ticketId - ID тикета
   * @returns {Promise<Array>} Список комментариев
   */
  static async getComments(ticketId) {
    console.log('Getting comments for ticket:', ticketId);
    
    const query = `
      SELECT 
        tc.*,
        u.email as user_email,
        u.full_name as user_name
      FROM ticket_comments tc
      LEFT JOIN users u ON tc.user_id = u.id
      WHERE tc.ticket_id = ?
      ORDER BY tc.created_at ASC
    `;
    
    const comments = await getRows(query, [ticketId]);
    console.log('Found comments:', comments);
    
    return comments;
  }

  /**
   * Добавляет комментарий к тикету
   * 
   * @param {number} ticketId - ID тикета
   * @param {string} comment - Текст комментария
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} Созданный комментарий
   */
  static async addComment(ticketId, comment, userId) {
    console.log('Adding comment to ticket:', { ticketId, comment, userId });

    // Проверяем существование тикета
    const ticketExists = await getRow('SELECT id FROM tickets WHERE id = ?', [ticketId]);
    if (!ticketExists) {
      throw new Error('Тикет не найден');
    }

    // Добавляем комментарий
    const result = await runQuery(
      'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
      [ticketId, userId, comment]
    );

    // Получаем созданный комментарий с информацией о пользователе
    const newComment = await getRow(
      `SELECT tc.*, u.email as user_email, u.full_name as user_name
       FROM ticket_comments tc
       LEFT JOIN users u ON tc.user_id = u.id
       WHERE tc.id = ?`,
      [result.lastID]
    );

    return newComment;
  }

  /**
   * Получает статистику тикетов для компании
   * Для роли owner возвращает статистику по всем компаниям
   * 
   * @param {number} companyId - ID компании
   * @param {string} userRole - Роль пользователя
   * @returns {Promise<Object>} Статистика тикетов
   */
  static async getStats(companyId, userRole) {
    try {
      let companyCondition = 'WHERE company_id = ?';
      let statusCondition = '';
      let params = [companyId];

      // Для owner показываем статистику по всем компаниям
      if (userRole === 'owner') {
        companyCondition = ''; // Убираем фильтр по компании
        params = []; // Очищаем параметры
      }

      // Пользователи с ролями user, tech_admin и admin не должны видеть тикеты со статусом hidden
      if (userRole !== 'owner') {
        statusCondition = ' AND status != ?';
        params.push('hidden');
      }

      // Если есть хотя бы одно условие, добавляем WHERE
      const whereClause = (companyCondition || statusCondition) 
        ? (companyCondition ? companyCondition : 'WHERE 1=1') + statusCondition
        : '';

      const totalQuery = `
        SELECT COUNT(*) as total FROM tickets 
        ${whereClause}
      `;
      const totalResult = await getRow(totalQuery, params);

      const byStatusQuery = `
        SELECT status, COUNT(*) as count FROM tickets 
        ${whereClause}
        GROUP BY status
      `;
      const byStatusResult = await getRows(byStatusQuery, params);

      // Преобразуем массив объектов в объект с ключами статусов
      const byStatusObj = {};
      byStatusResult.forEach(item => {
        byStatusObj[item.status] = item.count;
      });
      
      // Убедимся, что все возможные статусы есть в объекте
      const allStatuses = ['open', 'in_progress', 'closed', 'hidden'];
      allStatuses.forEach(status => {
        if (byStatusObj[status] === undefined) {
          byStatusObj[status] = 0;
        }
      });

      const byUrgencyQuery = `
        SELECT urgency, COUNT(*) as count FROM tickets 
        ${whereClause}
        GROUP BY urgency
      `;
      const byUrgencyResult = await getRows(byUrgencyQuery, params);

      // Преобразуем массив объектов в объект с ключами срочности
      const byUrgencyObj = {};
      byUrgencyResult.forEach(item => {
        byUrgencyObj[item.urgency] = item.count;
      });
      
      // Убедимся, что все возможные уровни срочности есть в объекте
      const allUrgencies = ['low', 'medium', 'high'];
      allUrgencies.forEach(urgency => {
        if (byUrgencyObj[urgency] === undefined) {
          byUrgencyObj[urgency] = 0;
        }
      });

      const byCategoryQuery = `
        SELECT category, COUNT(*) as count FROM tickets 
        ${whereClause}
        GROUP BY category
      `;
      const byCategoryResult = await getRows(byCategoryQuery, params);

      // Преобразуем массив объектов в объект с ключами категорий
      const byCategoryObj = {};
      byCategoryResult.forEach(item => {
        byCategoryObj[item.category] = item.count;
      });
      
      // Убедимся, что все возможные категории есть в объекте
      const allCategories = ['bug', 'feature', 'task', 'other'];
      allCategories.forEach(category => {
        if (byCategoryObj[category] === undefined) {
          byCategoryObj[category] = 0;
        }
      });

      // Для owner добавляем статистику по компаниям
      let byCompanyObj = {};
      if (userRole === 'owner') {
        const byCompanyQuery = `
          SELECT c.id, c.name, COUNT(t.id) as count 
          FROM tickets t
          JOIN companies c ON t.company_id = c.id
          GROUP BY c.id, c.name
        `;
        const byCompanyResult = await getRows(byCompanyQuery, []);
        
        byCompanyResult.forEach(item => {
          byCompanyObj[item.id] = {
            name: item.name,
            count: item.count
          };
        });
      }

      return {
        total: totalResult.total,
        byStatus: byStatusObj,
        byUrgency: byUrgencyObj,
        byCategory: byCategoryObj,
        ...(userRole === 'owner' ? { byCompany: byCompanyObj } : {})
      };
    } catch (err) {
      console.error('Error getting ticket stats:', err);
      throw new Error('Ошибка при получении статистики тикетов');
    }
  }

  /**
   * Получает последние тикеты компании
   * Для роли owner возвращает тикеты всех компаний
   * 
   * @param {number} companyId - ID компании
   * @param {number} limit - Количество тикетов
   * @param {string} userRole - Роль пользователя
   * @returns {Promise<Array>} Список последних тикетов
   */
  static async getRecentTickets(companyId, limit = 5, userRole) {
    try {
      let companyCondition = 'WHERE t.company_id = ?';
      let statusCondition = '';
      let params = [companyId];

      // Для owner показываем тикеты всех компаний
      if (userRole === 'owner') {
        companyCondition = ''; // Убираем фильтр по компании
        params = []; // Очищаем параметры
      }

      // Пользователи с ролями user, tech_admin и admin не должны видеть тикеты со статусом hidden
      if (userRole !== 'owner') {
        statusCondition = companyCondition ? ' AND t.status != ?' : 'WHERE t.status != ?';
        params.push('hidden');
      }

      // Соединяем условия
      const whereClause = companyCondition + statusCondition;

      let query = `
        SELECT t.*, u.email as creator_email, u.full_name as creator_name, c.name as company_name
        FROM tickets t
        LEFT JOIN users u ON t.created_by = u.id
        LEFT JOIN companies c ON t.company_id = c.id
        ${whereClause}
        ORDER BY t.created_at DESC LIMIT ?
      `;
      params.push(limit);

      return await getRows(query, params);
    } catch (err) {
      console.error('Error getting recent tickets:', err);
      throw new Error('Ошибка при получении последних тикетов');
    }
  }
}

module.exports = Ticket; 