const { User, Ticket } = require('../models');

class TicketController {
  static async create(req, res) {
    try {
      const { title, description, category, urgency, company_id, assigned_role } = req.body;

      if (!title || !description || !category || !urgency || !company_id) {
        return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
      }

      // Проверка роли, если она указана
      if (assigned_role && !['admin', 'tech_admin'].includes(assigned_role)) {
        return res.status(400).json({ error: 'Недопустимая роль. Разрешены только admin и tech_admin' });
      }

      const ticketData = {
        title,
        description,
        category,
        urgency,
        company_id,
        assigned_role,
        created_by: req.userId
      };

      const ticket = await Ticket.create(ticketData);
      return res.status(201).json(ticket);
    } catch (error) {
      console.error(error);
      if (error.message === 'Компания не найдена' ||
          error.message === 'Пользователь не найден') {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
}

module.exports = TicketController; 