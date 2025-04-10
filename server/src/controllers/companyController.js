const Company = require('../models/company');

class CompanyController {
  /**
   * Получаем список всех компаний
   * Только владелец может видеть все компании, остальные получают 403
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async getAll(req, res) {
    try {
      // Проверяем роль пользователя - только owner может видеть все компании
      if (req.user.role !== 'owner') {
        return res.status(403).json({ error: 'Только владелец может видеть все компании' });
      }

      // Получаем список компаний и сразу отправляем ответ
      const companies = await Company.getAll();
      res.status(200).json(companies);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Получаем компанию по ID
   * Если компания не найдена, возвращаем 404
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async getById(req, res) {
    try {
      const company = await Company.getById(req.params.id);
      
      // Если компания не найдена, возвращаем 404
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Проверяем права доступа
      if (req.user.role !== 'owner' && req.user.company_id !== company.id) {
        return res.status(403).json({ error: 'Нет прав на просмотр этой компании' });
      }

      res.status(200).json(company);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Создаем новую компанию
   * Только владелец может создавать компании
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async create(req, res) {
    const { name } = req.body;

    // Проверяем роль пользователя
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Только владелец может создавать компании' });
    }

    try {
      // Создаем компанию и возвращаем её ID
      const companyId = await Company.create(name);
      res.status(201).json({ id: companyId, name });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Получаем список пользователей компании
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async getUsers(req, res) {
    try {
      // Проверяем существование компании
      const company = await Company.getById(req.params.companyId);
      if (!company) {
        return res.status(404).json({ error: 'Компания не найдена' });
      }

      // Проверяем права доступа
      if (req.user.role !== 'owner' && req.user.company_id !== parseInt(req.params.companyId)) {
        return res.status(403).json({ error: 'Нет прав на просмотр пользователей этой компании' });
      }

      // Получаем пользователей компании и сразу отправляем ответ
      const users = await Company.getUsers(req.params.companyId);
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Удаляет компанию
   * Только владелец может удалять компании
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async delete(req, res) {
    try {
      // Проверяем роль пользователя
      if (req.user.role !== 'owner') {
        return res.status(403).json({ error: 'Только владелец может удалять компании' });
      }

      // Проверяем существование компании
      const company = await Company.getById(req.params.id);
      if (!company) {
        return res.status(404).json({ error: 'Компания не найдена' });
      }

      // Удаляем компанию
      const deleted = await Company.delete(req.params.id);
      if (!deleted) {
        return res.status(500).json({ error: 'Ошибка при удалении компании' });
      }

      res.status(200).json({ message: 'Компания успешно удалена' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Обновляем информацию о компании
   * Только владелец может обновлять компании
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async update(req, res) {
    try {
      // Проверяем роль пользователя
      if (req.user.role !== 'owner') {
        return res.status(403).json({ error: 'Только владелец может обновлять компании' });
      }

      const { name } = req.body;
      const companyId = req.params.id;

      // Проверяем существование компании
      const company = await Company.getById(companyId);
      if (!company) {
        return res.status(404).json({ error: 'Компания не найдена' });
      }

      // Обновляем компанию
      await Company.update(companyId, { name });

      // Получаем обновленную информацию о компании
      const updatedCompany = await Company.getById(companyId);
      res.status(200).json(updatedCompany);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
}

module.exports = CompanyController; 