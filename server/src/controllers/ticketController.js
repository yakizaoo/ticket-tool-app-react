const Ticket = require('../models/ticket');
const { getRow, getRows, executeQuery, runQuery } = require('../config/database');
const User = require('../models/user');

class TicketController {
  constructor() {
    // Обновляем статусы существующих тикетов при запуске
    Ticket.updateExistingStatuses().then(success => {
      if (!success) {
        console.warn('Failed to update ticket statuses on startup, but continuing...');
      }
    }).catch(err => {
      console.error('Error updating ticket statuses on startup:', err);
      // Не прерываем работу сервера из-за этой ошибки
    });
  }

  /**
   * Получаем список тикетов
   * owner видит все тикеты (включая hidden)
   * user видит только свои открытые и архивированные тикеты
   * tech_admin и admin видят все тикеты своей компании (кроме hidden)
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  async getAll(req, res) {
    try {
      console.log('Getting all tickets');
      console.log('Request query:', req.query);
      console.log('User:', req.user);
      
      // Проверяем параметры запроса для фильтрации
      const filters = {};
      
      // Фильтрация по статусу, если указан
      if (req.query.status) {
        filters.status = req.query.status;
        console.log('Filtering by status:', req.query.status);
      }
      
      // Для обычных пользователей показываем только их собственные тикеты
      if (req.user.role === 'user') {
        console.log('User role detected, filtering tickets by created_by:', req.user.id);
        // Получаем тикеты пользователя
        const userTickets = await Ticket.getByUser(req.user.id, filters);
        console.log(`Found ${userTickets.length} tickets for user ${req.user.id}`);
        return res.json(userTickets);
      }
      
      // Для остальных ролей - стандартный запрос
      const tickets = await Ticket.getAll(filters, {
        role: req.user.role,
        company_id: req.user.company_id,
        id: req.user.id
      });
      
      console.log(`Found ${tickets.length} tickets matching criteria`);
      res.json(tickets);
    } catch (err) {
      console.error('Error getting tickets:', err);
      res.status(500).json({ error: 'Ошибка при получении тикетов' });
    }
  }

  /**
   * Создаем новый тикет
   * Проверяем права на создание тикета в компании
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  async create(req, res) {
    try {
      const { title, description, category, urgency, company_id } = req.body;
      console.log('Request body:', req.body);
      console.log('Extracted assigned_role:', req.body.assigned_role);
      console.log('Type of assigned_role:', typeof req.body.assigned_role);

      // Валидация входных данных
      if (!title || !category || !urgency) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
      }

      // Проверка значений категории и срочности
      const validCategories = ['bug', 'feature', 'task', 'other'];
      const validUrgencies = ['low', 'medium', 'high'];
      
      if (!validCategories.includes(category)) {
        console.log('Invalid category:', category);
        return res.status(400).json({ error: 'Недопустимая категория' });
      }
      if (!validUrgencies.includes(urgency)) {
        console.log('Invalid urgency:', urgency);
        return res.status(400).json({ error: 'Недопустимая срочность' });
      }

      // Проверка assigned_role
      const validRoles = ['admin', 'tech_admin'];
      console.log('=== Role Validation Debug ===');
      console.log('Request body:', req.body);
      console.log('Checking assigned_role:', req.body.assigned_role);
      console.log('Type of assigned_role:', typeof req.body.assigned_role);
      console.log('Valid roles:', validRoles);
      console.log('Is assigned_role undefined?', req.body.assigned_role === undefined);
      console.log('Is assigned_role null?', req.body.assigned_role === null);
      console.log('Is assigned_role a string?', typeof req.body.assigned_role === 'string');
      console.log('Is assigned_role in validRoles?', validRoles.includes(req.body.assigned_role));
      console.log('Validation condition:', req.body.assigned_role !== undefined && req.body.assigned_role !== null && typeof req.body.assigned_role === 'string' && !validRoles.includes(req.body.assigned_role));
      console.log('========================');

      if (req.body.assigned_role !== undefined && req.body.assigned_role !== null) {
        if (typeof req.body.assigned_role !== 'string' || !validRoles.includes(req.body.assigned_role)) {
          console.log('Invalid role detected:', req.body.assigned_role);
          console.log('Sending 400 response with error message');
          return res.status(400).json({ error: 'Недопустимая роль. Разрешены только admin и tech_admin' });
        }
      }
      console.log('Role validation passed');

      // Проверка прав на создание тикета в компании
      if (req.user.role !== 'owner' && req.user.company_id !== company_id) {
        console.log('Permission denied. User role:', req.user.role, 'User company:', req.user.company_id, 'Target company:', company_id);
        return res.status(403).json({ error: 'Нет прав на создание тикета в этой компании' });
      }

      // Создаем тикет только если все проверки пройдены успешно
      console.log('=== Creating Ticket ===');
      console.log('All validations passed, creating ticket with data:', {
        title,
        description,
        category,
        urgency,
        company_id: company_id || req.user.company_id,
        created_by: req.userId,
        assigned_role: req.body.assigned_role,
        comment: req.body.comment
      });
      try {
        const ticket = await Ticket.create({
          title,
          description,
          category,
          urgency,
          company_id: company_id || req.user.company_id,
          created_by: req.userId,
          assigned_role: req.body.assigned_role,
          comment: req.body.comment
        });

        console.log('Ticket created successfully:', ticket);
        return res.status(201).json(ticket);
      } catch (error) {
        console.error('Error creating ticket:', error);
        if (error.message.includes('Недопустимая роль')) {
          return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Ошибка при создании тикета' });
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      return res.status(500).json({ error: 'Ошибка при создании тикета' });
    }
  }

  /**
   * Удаляем тикет (делаем его hidden)
   * owner и admin могут удалять тикеты
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      console.log('=== Delete Ticket Request ===');
      console.log('Request params:', req.params);
      console.log('User from request:', req.user);
      console.log('User ID from request:', req.userId);
      console.log('===========================');

      if (!req.user) {
        console.log('No user object in request');
        return res.status(403).json({ error: 'Ошибка аутентификации' });
      }

      if (req.user.role !== 'owner' && req.user.role !== 'admin') {
        console.log('Access denied:', {
          userRole: req.user.role,
          requiredRoles: ['owner', 'admin']
        });
        return res.status(403).json({ error: 'Только owner и admin могут удалять тикеты' });
      }

      const ticket = await Ticket.getById(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Тикет не найден' });
      }

      console.log('Ticket found:', {
        ticketId: ticket.id,
        ticketCompanyId: ticket.company_id,
        userCompanyId: req.user.company_id
      });

      // Проверяем, что admin может удалять только тикеты своей компании
      if (req.user.role === 'admin' && req.user.company_id !== ticket.company_id) {
        console.log('Company mismatch:', {
          userCompanyId: req.user.company_id,
          ticketCompanyId: ticket.company_id
        });
        return res.status(403).json({ error: 'Нет прав на удаление этого тикета' });
      }

      await Ticket.updateStatus(id, 'hidden', 'Тикет удален', req.userId);
      res.status(200).json({ message: 'Тикет успешно удален' });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      res.status(500).json({ error: 'Ошибка при удалении тикета' });
    }
  }

  /**
   * Обновляем статус тикета
   * tech_admin может менять статус на любой, кроме hidden
   * admin может менять статус на любой
   * user может только архивировать свои тикеты
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, comment } = req.body;

      if (!comment) {
        return res.status(400).json({ error: 'Необходимо указать комментарий' });
      }

      const ticket = await Ticket.getById(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Тикет не найден' });
      }

      // Валидация статуса
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed', 'hidden'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Недопустимый статус' });
      }

      // Проверка прав доступа
      if (req.user.role === 'user') {
        if (ticket.created_by !== req.userId) {
          return res.status(403).json({ error: 'Нет прав на изменение этого тикета' });
        }
        if (status !== 'hidden' && status !== 'closed') {
          return res.status(403).json({ error: 'Пользователь может только скрывать или закрывать свои тикеты' });
        }
        // Проверяем, что тикет находится в статусе open или in_progress
        if (status === 'closed' && ticket.status !== 'open' && ticket.status !== 'in_progress') {
          return res.status(403).json({ error: 'Можно закрывать только открытые тикеты или тикеты в работе' });
        }
      }

      if (req.user.role === 'tech_admin') {
        // Проверяем, что tech_admin может менять только тикеты своей компании
        if (req.user.company_id !== ticket.company_id) {
          return res.status(403).json({ error: 'Нет прав на изменение этого тикета' });
        }
        // tech_admin не может скрывать тикеты
        if (status === 'hidden') {
          return res.status(403).json({ error: 'Tech Admin не может скрывать тикеты' });
        }
      }

      if (req.user.role === 'admin') {
        // Проверяем, что admin может менять только тикеты своей компании
        if (req.user.company_id !== ticket.company_id) {
          return res.status(403).json({ error: 'Нет прав на изменение этого тикета' });
        }
      }

      // Добавляем запись в историю изменений
      await Ticket.addHistoryRecord({
        ticket_id: id,
        user_id: req.userId,
        action_type: 'status_change',
        old_value: ticket.status,
        new_value: status,
        comment: comment
      });

      await Ticket.updateStatus(id, status, comment, req.userId);
      res.status(200).json({ message: 'Статус тикета успешно обновлен' });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      res.status(500).json({ error: 'Ошибка при обновлении статуса тикета' });
    }
  }

  /**
   * Полностью удаляет тикет (только для owner)
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  async permanentDelete(req, res) {
    try {
      const { id } = req.params;
      console.log('Starting permanent delete process');
      console.log('Request params:', req.params);
      console.log('Request body:', req.body);
      console.log('User from request:', req.user);
      console.log('User ID from request:', req.userId);

      if (!req.user) {
        console.log('No user object in request');
        return res.status(403).json({ error: 'Ошибка аутентификации' });
      }

      if (req.user.role !== 'owner') {
        console.log('Access denied:', {
          userRole: req.user.role,
          requiredRole: 'owner'
        });
        return res.status(403).json({ error: 'Только owner может перманентно удалять тикеты' });
      }

      const ticket = await Ticket.getById(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Тикет не найден' });
      }

      console.log('Ticket found:', {
        ticketId: ticket.id,
        ticketCompanyId: ticket.company_id,
        userCompanyId: req.user.company_id
      });
      
      const result = await Ticket.delete(id);
      if (result) {
        res.status(200).json({ message: 'Тикет успешно удален' });
      } else {
        res.status(404).json({ error: 'Тикет не найден' });
      }
    } catch (error) {
      console.error('Error permanently deleting ticket:', error);
      res.status(500).json({ error: 'Ошибка при удалении тикета' });
    }
  }

  /**
   * Получает историю изменений тикета
   */
  async getHistory(req, res) {
    try {
      const ticketId = req.params.id;
      const history = await Ticket.getHistory(ticketId);
      res.json(history);
    } catch (error) {
      console.error('Error getting ticket history:', error);
      res.status(500).json({ error: 'Ошибка при получении истории тикета' });
    }
  }

  /**
   * Обновляем тикет
   */
  async update(req, res) {
    try {
      const ticketId = req.params.id;
      const { title, description, category, urgency, assigned_role } = req.body;
      const userId = req.userId;

      // Получаем текущий тикет для сравнения
      const currentTicket = await Ticket.getById(ticketId);
      if (!currentTicket) {
        return res.status(404).json({ error: 'Тикет не найден' });
      }

      // Проверяем права доступа
      if (!this.hasAccess(currentTicket, req.user)) {
        return res.status(403).json({ error: 'Нет прав для редактирования тикета' });
      }

      // Обновляем тикет
      const updatedTicket = await Ticket.update(ticketId, {
        title,
        description,
        category,
        urgency,
        assigned_role,
        updated_by: userId
      });

      // Записываем изменения в историю
      const changes = [];
      if (title !== currentTicket.title) {
        changes.push({
          ticket_id: ticketId,
          user_id: userId,
          action_type: 'title_change',
          old_value: currentTicket.title,
          new_value: title
        });
      }
      if (category !== currentTicket.category) {
        changes.push({
          ticket_id: ticketId,
          user_id: userId,
          action_type: 'category_change',
          old_value: currentTicket.category,
          new_value: category
        });
      }
      if (urgency !== currentTicket.urgency) {
        changes.push({
          ticket_id: ticketId,
          user_id: userId,
          action_type: 'urgency_change',
          old_value: currentTicket.urgency,
          new_value: urgency
        });
      }
      if (assigned_role !== currentTicket.assigned_role) {
        changes.push({
          ticket_id: ticketId,
          user_id: userId,
          action_type: 'role_change',
          old_value: currentTicket.assigned_role,
          new_value: assigned_role
        });
      }

      // Сохраняем все изменения в истории
      for (const change of changes) {
        await Ticket.addHistoryRecord(change);
      }

      res.json(updatedTicket);
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(500).json({ error: 'Ошибка при обновлении тикета' });
    }
  }

  /**
   * Получаем тикет по ID
   * Проверяем права доступа к тикету
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      console.log('Getting ticket by ID:', id);
      console.log('User:', req.user);

      // Получаем тикет
      const ticket = await Ticket.getById(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Тикет не найден' });
      }

      // Проверяем права доступа
      // Владелец (owner) может видеть тикеты всех компаний
      // Остальные пользователи могут видеть только тикеты своей компании
      if (req.user.role !== 'owner' && ticket.company_id !== req.user.company_id) {
        console.log('Company mismatch:', {
          userCompanyId: req.user.company_id,
          ticketCompanyId: ticket.company_id
        });
        return res.status(403).json({ error: 'Нет доступа к этому тикету' });
      }

      // Пользователи с ролями user, tech_admin и admin не должны видеть тикеты со статусом hidden
      if (ticket.status === 'hidden' && req.user.role !== 'owner') {
        return res.status(404).json({ error: 'Тикет не найден' });
      }

      if (req.user.role === 'user') {
        // user видит только свои тикеты
        if (ticket.created_by !== req.user.id) {
          return res.status(403).json({ error: 'Нет доступа к этому тикету' });
        }
      }

      res.json(ticket);
    } catch (err) {
      console.error('Error getting ticket:', err);
      res.status(500).json({ error: 'Ошибка при получении тикета' });
    }
  }

  /**
   * Получает комментарии к тикету
   */
  async getComments(req, res) {
    try {
      const ticketId = req.params.id;
      
      // Получаем текущий тикет
      const ticket = await Ticket.getById(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: 'Тикет не найден' });
      }

      // Проверяем права доступа
      if (!this.hasAccess(ticket, req.user)) {
        return res.status(403).json({ error: 'Нет прав для просмотра комментариев' });
      }
      
      const comments = await Ticket.getComments(ticketId);
      res.json(comments);
    } catch (error) {
      console.error('Error getting ticket comments:', error);
      res.status(500).json({ error: 'Ошибка при получении комментариев' });
    }
  }

  /**
   * Добавляет комментарий к тикету
   */
  async addComment(req, res) {
    try {
      const ticketId = req.params.id;
      const { comment } = req.body;
      const userId = req.userId;

      // Получаем текущий тикет
      const ticket = await Ticket.getById(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: 'Тикет не найден' });
      }

      // Проверяем права доступа
      if (!this.hasAccess(ticket, req.user)) {
        return res.status(403).json({ error: 'Нет прав для добавления комментария' });
      }

      // Добавляем комментарий
      const newComment = await Ticket.addComment(ticketId, comment, userId);

      // Добавляем запись в историю изменений
      await Ticket.addHistoryRecord({
        ticket_id: ticketId,
        user_id: userId,
        action_type: 'comment_added',
        old_value: ticket.comment || '',
        new_value: comment
      });

      res.json(newComment);
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Ошибка при добавлении комментария' });
    }
  }

  /**
   * Проверяет, имеет ли пользователь доступ к тикету для редактирования
   * 
   * @param {Object} ticket - Тикет
   * @param {Object} user - Пользователь
   * @returns {boolean} Имеет ли пользователь доступ
   */
  hasAccess(ticket, user) {
    // Владелец имеет полный доступ ко всем тикетам в системе
    if (user.role === 'owner') {
      return true;
    }
    
    // Для всех других ролей - только тикеты своей компании
    if (ticket.company_id !== user.company_id) {
      return false;
    }
    
    // Пользователи с ролью admin и tech_admin могут редактировать любые тикеты своей компании
    if (user.role === 'admin' || user.role === 'tech_admin') {
      return true;
    }
    
    // Пользователи с ролью user могут редактировать только свои тикеты
    if (user.role === 'user') {
      return ticket.created_by === user.id;
    }
    
    // По умолчанию отказываем в доступе
    return false;
  }

  /**
   * Получаем статистику тикетов
   * owner видит статистику всех тикетов
   * user видит статистику только своих тикетов
   * tech_admin и admin видят статистику тикетов своей компании
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  async getStats(req, res) {
    try {
      const stats = await Ticket.getStats(req.user.company_id, req.user.role);
      const recentTickets = await Ticket.getRecentTickets(req.user.company_id, 5, req.user.role);
      
      res.json({
        stats,
        recentTickets
      });
    } catch (err) {
      console.error('Error getting ticket stats:', err);
      res.status(500).json({ error: 'Ошибка при получении статистики тикетов' });
    }
  }
}

module.exports = new TicketController(); 