const { db, runQuery, getRow, getRows } = require('../config/database');

class Company {
  /**
   * Создает новую компанию
   * 
   * @param {string} name - Название компании
   * @returns {Promise<number>} ID созданной компании
   */
  static async create(name) {
    return new Promise((resolve, reject) => {
      runQuery('INSERT INTO companies (name) VALUES (?)', [name])
        .then(result => resolve(result.lastID))
        .catch(err => reject(err));
    });
  }

  /**
   * Получает все компании
   * 
   * @returns {Promise<Array>} Список всех компаний
   */
  static async getAll() {
    return getRows('SELECT * FROM companies');
  }

  /**
   * Получает компанию по ID
   * 
   * @param {number} id - ID компании
   * @returns {Promise<Object|null>} Данные компании или null, если не найдена
   */
  static async getById(id) {
    return getRow('SELECT * FROM companies WHERE id = ?', [id]);
  }

  /**
   * Получает список пользователей компании
   * 
   * @param {number} companyId - ID компании
   * @returns {Promise<Array>} Список пользователей компании
   */
  static async getUsers(companyId) {
    return getRows(`
      SELECT id, email, full_name, role 
      FROM users 
      WHERE company_id = ?
    `, [companyId]);
  }

  /**
   * Переносит пользователей из одной компании в другую
   * 
   * @param {number} fromCompanyId - ID исходной компании
   * @param {number} toCompanyId - ID целевой компании
   * @returns {Promise<boolean>} true если перенос успешен
   */
  static async transferUsers(fromCompanyId, toCompanyId) {
    return new Promise((resolve, reject) => {
      runQuery('UPDATE users SET company_id = ? WHERE company_id = ?', [toCompanyId, fromCompanyId])
        .then(result => resolve(true))
        .catch(err => reject(err));
    });
  }

  /**
   * Удаляет все тикеты компании
   * 
   * @param {number} companyId - ID компании
   * @returns {Promise<boolean>} true если тикеты удалены
   */
  static async deleteTickets(companyId) {
    return new Promise((resolve, reject) => {
      console.log(`Удаление тикетов компании ${companyId}`);
      runQuery('DELETE FROM tickets WHERE company_id = ?', [companyId])
        .then(result => {
          console.log(`Удалено тикетов: ${result.changes}`);
          resolve(true);
        })
        .catch(err => {
          console.error('Ошибка при удалении тикетов:', err);
          reject(err);
        });
    });
  }

  /**
   * Удаляет всех пользователей компании
   * 
   * @param {number} companyId - ID компании
   * @returns {Promise<boolean>} true если пользователи удалены
   */
  static async deleteUsers(companyId) {
    return new Promise((resolve, reject) => {
      console.log(`Удаление пользователей компании ${companyId}`);
      runQuery('DELETE FROM users WHERE company_id = ?', [companyId])
        .then(result => {
          console.log(`Удалено пользователей: ${result.changes}`);
          resolve(true);
        })
        .catch(err => {
          console.error('Ошибка при удалении пользователей:', err);
          reject(err);
        });
    });
  }

  /**
   * Удаляет компанию по ID
   * Сначала удаляет все тикеты, затем пользователей, и наконец саму компанию
   * 
   * @param {number} id - ID компании
   * @returns {Promise<boolean>} true если компания удалена
   */
  static async delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`Начало удаления компании ${id}`);
        
        // Проверка, есть ли другие компании, если пытаемся удалить компанию с ID = 1
        if (id == 1) {
          console.log('Специальная обработка для удаления компании с ID = 1');
          
          // Проверяем наличие других компаний
          const otherCompanies = await getRows('SELECT id FROM companies WHERE id != 1 LIMIT 1');
          
          if (otherCompanies.length === 0) {
            console.error('Невозможно удалить компанию с ID = 1, так как нет других компаний');
            return reject(new Error('Невозможно удалить системную компанию, так как нет других компаний для переноса данных'));
          }
          
          const targetCompanyId = otherCompanies[0].id;
          console.log(`Перенос данных в компанию с ID = ${targetCompanyId}`);
          
          // Переносим тикеты в другую компанию
          await runQuery('UPDATE tickets SET company_id = ? WHERE company_id = 1', [targetCompanyId]);
          console.log('Тикеты перенесены в другую компанию');
          
          // Переносим пользователей в другую компанию
          await runQuery('UPDATE users SET company_id = ? WHERE company_id = 1', [targetCompanyId]);
          console.log('Пользователи перенесены в другую компанию');
          
          // Удаляем компанию
          const result = await runQuery('DELETE FROM companies WHERE id = 1');
          console.log(`Компания с ID = 1 удалена: ${result.changes > 0}`);
          resolve(result.changes > 0);
          return;
        }
        
        // Стандартная процедура удаления для других компаний
        // Сначала удаляем все тикеты компании
        await this.deleteTickets(id);
        console.log(`Тикеты компании ${id} удалены`);
        
        // Затем удаляем всех пользователей компании
        await this.deleteUsers(id);
        console.log(`Пользователи компании ${id} удалены`);
        
        // Наконец удаляем саму компанию
        const result = await runQuery('DELETE FROM companies WHERE id = ?', [id]);
        console.log(`Компания ${id} удалена: ${result.changes > 0}`);
        resolve(result.changes > 0);
      } catch (err) {
        console.error('Ошибка при удалении компании:', err);
        reject(err);
      }
    });
  }

  /**
   * Обновляет информацию о компании
   * 
   * @param {number} id - ID компании
   * @param {Object} data - Данные для обновления
   * @param {string} data.name - Новое название компании
   * @returns {Promise<void>}
   */
  static async update(id, data) {
    const { name } = data;
    if (!name) {
      throw new Error('Необходимо указать название компании');
    }

    return new Promise((resolve, reject) => {
      runQuery('UPDATE companies SET name = ? WHERE id = ?', [name, id])
        .then(result => {
          if (result.changes === 0) {
            reject(new Error('Компания не найдена'));
            return;
          }
          resolve();
        })
        .catch(err => reject(err));
    });
  }
}

module.exports = Company; 