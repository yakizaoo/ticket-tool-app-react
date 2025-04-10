const Ticket = require('../models/ticket');

class DashboardController {
  /**
   * Получаем статистику для дашборда
   * owner видит статистику всех тикетов
   * user видит статистику только своих тикетов
   * tech_admin и admin видят статистику тикетов своей компании
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  async getStats(req, res) {
    try {
      console.log('Getting dashboard stats');
      console.log('User:', req.user);
      
      let stats, recentTickets;
      
      if (req.user.role === 'user') {
        // Для обычных пользователей получаем статистику только по их тикетам
        console.log('User role detected, getting stats only for user tickets');
        // Получаем тикеты пользователя для статистики
        const userTickets = await Ticket.getByUser(req.user.id);
        
        // Определяем количество по статусам
        const statusCounts = {
          open: 0,
          in_progress: 0,
          closed: 0,
          hidden: 0
        };
        
        // Определяем количество по категориям
        const categoryCounts = {
          bug: 0,
          feature: 0,
          task: 0,
          other: 0
        };
        
        // Определяем количество по срочности
        const urgencyCounts = {
          low: 0,
          medium: 0,
          high: 0
        };
        
        // Подсчитываем статистику
        userTickets.forEach(ticket => {
          if (statusCounts[ticket.status] !== undefined) {
            statusCounts[ticket.status]++;
          }
          
          if (categoryCounts[ticket.category] !== undefined) {
            categoryCounts[ticket.category]++;
          }
          
          if (urgencyCounts[ticket.urgency] !== undefined) {
            urgencyCounts[ticket.urgency]++;
          }
        });
        
        stats = {
          total: userTickets.length,
          byStatus: statusCounts,
          byCategory: categoryCounts,
          byUrgency: urgencyCounts
        };
        
        // Получаем последние 5 тикетов пользователя
        recentTickets = userTickets.slice(0, 5);
      } else {
        // Для остальных ролей используем стандартные методы
        stats = await Ticket.getStats(req.user.company_id, req.user.role);
        recentTickets = await Ticket.getRecentTickets(req.user.company_id, 5, req.user.role);
      }
      
      console.log('Stats:', stats);
      console.log(`Recent tickets: ${recentTickets.length}`);
      
      res.json({
        stats,
        recentTickets
      });
    } catch (err) {
      console.error('Error getting dashboard stats:', err);
      res.status(500).json({ error: 'Ошибка при получении статистики дашборда' });
    }
  }
}

module.exports = new DashboardController(); 