const User = require('../models/user');
const Company = require('../models/company');
const bcrypt = require('bcryptjs');

class UserController {
  /**
   * Получаем список пользователей
   * Владелец видит всех пользователей, остальные только своей компании
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async getAll(req, res) {
    try {
      let users;
      // Владелец видит всех пользователей, остальные только своей компании
      if (req.user.role === 'owner') {
        users = await User.getAll();
      } else {
        // Проверяем существование компании
        const company = await Company.getById(req.user.company_id);
        if (!company) {
          return res.status(404).json({ error: 'Компания не найдена' });
        }
        // Получаем пользователей только своей компании
        users = await User.getByCompany(req.user.company_id);
      }
      res.status(200).json(users);
    } catch (error) {
      console.error('Error in UserController.getAll:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Получаем информацию о конкретном пользователе
   * Владелец может видеть любого пользователя, остальные только своей компании
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async getById(req, res) {
    try {
      const userId = req.params.id;
      const user = await User.getById(userId);

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Проверяем права доступа
      if (req.user.role !== 'owner' && req.user.company_id !== user.company_id) {
        return res.status(403).json({ error: 'Нет прав на просмотр этого пользователя' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error in UserController.getById:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Создаем нового пользователя
   * Проверяем права на создание пользователей с определенными ролями
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async create(req, res) {
    const { email, password, full_name, role, company_id } = req.body;

    try {
      console.log('Creating user with data:', { email, full_name, role, company_id });
      console.log('Current user:', req.user);

      // Проверяем существование компании
      const company = await Company.getById(company_id);
      if (!company) {
        console.log('Company not found:', company_id);
        return res.status(404).json({ error: 'Компания не найдена' });
      }

      // Проверяем права на создание пользователей с определенными ролями
      if (req.user.role === 'admin') {
        console.log('Admin creating user');
        if (role === 'owner') {
          console.log('Admin cannot create owner');
          return res.status(403).json({ error: 'Админ не может создавать пользователей с ролью owner' });
        }
        // Админ может создавать admin, tech_admin и user только в своей компании
        if (company_id !== req.user.company_id) {
          console.log('Admin cannot create users in other company');
          return res.status(403).json({ error: 'Нельзя создавать пользователей в другой компании' });
        }
      } else if (req.user.role === 'tech_admin') {
        console.log('Tech admin creating user');
        if (role !== 'user') {
          console.log('Tech admin can only create users');
          return res.status(403).json({ error: 'Tech Admin может создавать только пользователей с ролью user' });
        }
        if (company_id !== req.user.company_id) {
          console.log('Tech admin cannot create users in other company');
          return res.status(403).json({ error: 'Нельзя создавать пользователей в другой компании' });
        }
      } else if (req.user.role === 'user') {
        console.log('User cannot create other users');
        return res.status(403).json({ error: 'Пользователь не может создавать других пользователей' });
      }

      // Создаем пользователя
      console.log('Creating user in database');
      const userId = await User.create({
        email,
        password,
        full_name,
        role,
        company_id: req.user.role === 'owner' ? company_id : req.user.company_id
      });
      console.log('User created with ID:', userId);

      const user = await User.getById(userId);
      console.log('Created user:', user);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error in UserController.create:', error);
      res.status(500).json({ error: error.message || 'Ошибка сервера' });
    }
  }

  /**
   * Удаляем пользователя
   * Проверяем права на удаление пользователей
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async delete(req, res) {
    const userId = parseInt(req.params.id);

    try {
      console.log('Attempting to delete user:', userId);
      console.log('Current user:', req.user);

      // Проверяем существование пользователя
      const user = await User.getById(userId);
      if (!user) {
        console.log('User not found:', userId);
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      console.log('Found user to delete:', user);

      // Проверяем права на удаление
      if (req.user.role === 'user') {
        console.log('User role cannot delete other users');
        return res.status(403).json({ error: 'Пользователь не может удалять других пользователей' });
      }

      if (req.user.role === 'tech_admin') {
        if (user.role !== 'user') {
          console.log('Tech admin cannot delete non-user role');
          return res.status(403).json({ error: 'Tech Admin может удалять только пользователей с ролью user' });
        }
        if (req.user.company_id !== user.company_id) {
          console.log('Tech admin cannot delete users from other company');
          return res.status(403).json({ error: 'Tech Admin может удалять только пользователей своей компании' });
        }
      }

      if (req.user.role === 'admin') {
        if (user.role === 'owner') {
          console.log('Admin cannot delete owner role');
          return res.status(403).json({ error: 'Админ не может удалять пользователей с ролью owner' });
        }
        if (req.user.company_id !== user.company_id) {
          console.log('Admin cannot delete users from other company');
          return res.status(403).json({ error: 'Админ может удалять только пользователей своей компании' });
        }
      }

      console.log('Attempting to delete user from database');
      // Удаляем пользователя
      await User.delete(userId);
      console.log('User successfully deleted');
      res.status(200).json({ message: 'Пользователь успешно удален' });
    } catch (error) {
      console.error('Error in UserController.delete:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Обновление профиля пользователя
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async updateProfile(req, res) {
    try {
      console.log('Updating profile for user:', req.user);
      const { full_name, email, current_password, new_password } = req.body;
      const userId = req.userId;

      // Получаем текущего пользователя
      const user = await User.getById(userId);
      if (!user) {
        console.log('User not found:', userId);
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      console.log('Current user data:', user);

      // Проверяем, не занят ли email другим пользователем
      if (email !== user.email) {
        const existingUser = await User.getByEmail(email);
        if (existingUser) {
          console.log('Email already in use:', email);
          return res.status(400).json({ error: 'Этот email уже используется' });
        }
      }

      // Если меняется пароль, проверяем текущий пароль
      if (new_password) {
        if (!current_password) {
          console.log('Current password not provided');
          return res.status(400).json({ error: 'Необходимо указать текущий пароль' });
        }

        const validPassword = await bcrypt.compare(current_password, user.password);
        if (!validPassword) {
          console.log('Invalid current password');
          return res.status(400).json({ error: 'Неверный текущий пароль' });
        }

        // Хешируем новый пароль
        const hashedPassword = await bcrypt.hash(new_password, 10);
        await User.update(userId, {
          full_name,
          email,
          password: hashedPassword
        });
      } else {
        // Если пароль не меняется, обновляем только имя и email
        await User.update(userId, {
          full_name,
          email
        });
      }

      // Получаем обновленные данные пользователя
      const updatedUser = await User.getById(userId);
      delete updatedUser.password;

      console.log('Profile updated successfully:', updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Обновление данных пользователя по ID
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async updateById(req, res) {
    try {
      console.log('Updating user by ID:', req.params.id);
      console.log('Request body:', req.body);
      console.log('Current user:', req.user);

      const userId = parseInt(req.params.id);
      const { full_name, email, role, company_id, is_active } = req.body;

      // Получаем пользователя для обновления
      const userToUpdate = await User.getById(userId);
      if (!userToUpdate) {
        console.log('User not found:', userId);
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      console.log('Found user to update:', userToUpdate);

      // Проверяем права доступа
      // Владелец может редактировать любого пользователя полностью
      // Админ может редактировать только имя пользователей своей компании
      if (req.user.role === 'owner') {
        // Проверяем, не занят ли email другим пользователем
        if (email && email !== userToUpdate.email) {
          const existingUser = await User.getByEmail(email);
          if (existingUser && existingUser.id !== userId) {
            console.log('Email already in use:', email);
            return res.status(400).json({ error: 'Этот email уже используется' });
          }
        }

        // Проверяем существование компании, если меняется
        if (company_id && company_id !== userToUpdate.company_id) {
          const company = await Company.getById(company_id);
          if (!company) {
            console.log('Company not found:', company_id);
            return res.status(404).json({ error: 'Компания не найдена' });
          }
        }

        // Обновляем все поля
        await User.update(userId, {
          full_name: full_name || userToUpdate.full_name,
          email: email || userToUpdate.email,
          role: role || userToUpdate.role,
          company_id: company_id || userToUpdate.company_id,
          is_active: is_active !== undefined ? is_active : userToUpdate.is_active
        });
      } else if (req.user.role === 'admin') {
        // Админ может редактировать имя и роль пользователей своей компании
        if (req.user.company_id !== userToUpdate.company_id) {
          console.log('Admin cannot update users from other company');
          return res.status(403).json({ error: 'Админ может редактировать только пользователей своей компании' });
        }

        // Проверяем, что админ не пытается изменить запрещенные поля
        if (email || company_id) {
          console.log('Admin trying to update restricted fields');
          return res.status(403).json({ error: 'Админ может изменять только имя и роль пользователя' });
        }

        // Проверяем, что админ не пытается установить роль owner
        if (role === 'owner') {
          console.log('Admin trying to set owner role');
          return res.status(403).json({ error: 'Админ не может устанавливать роль Владельца' });
        }

        // Обновляем имя и возможно роль и статус активации
        const updateData = {
          full_name: full_name || userToUpdate.full_name
        };
        
        // Добавляем роль, если она указана и не owner
        if (role && role !== 'owner') {
          updateData.role = role;
        }
        
        // Добавляем статус активации, если он указан
        if (is_active !== undefined) {
          updateData.is_active = is_active;
        }
        
        await User.update(userId, updateData);
      } else {
        // Остальные роли не могут редактировать
        console.log('User with role', req.user.role, 'cannot update other users');
        return res.status(403).json({ error: 'Нет прав на редактирование пользователей' });
      }

      // Получаем обновленные данные пользователя
      const updatedUser = await User.getById(userId);
      delete updatedUser.password;

      console.log('User updated successfully:', updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error in updateById:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Деактивирует учетную запись пользователя
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async deactivateUser(req, res) {
    try {
      console.log('Deactivating user:', req.params.id);
      console.log('Current user:', req.user);

      const userId = parseInt(req.params.id);

      // Получаем пользователя для деактивации
      const userToDeactivate = await User.getById(userId);
      if (!userToDeactivate) {
        console.log('User not found:', userId);
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      console.log('Found user to deactivate:', userToDeactivate);

      // Проверяем права на деактивацию
      // Только владелец может деактивировать других владельцев
      if (userToDeactivate.role === 'owner' && req.user.role !== 'owner') {
        console.log('Only owner can deactivate another owner');
        return res.status(403).json({ error: 'Только владелец может деактивировать другого владельца' });
      }

      // Админ может деактивировать пользователей только своей компании
      if (req.user.role === 'admin' && req.user.company_id !== userToDeactivate.company_id) {
        console.log('Admin can only deactivate users from the same company');
        return res.status(403).json({ error: 'Админ может деактивировать только пользователей своей компании' });
      }

      // Не даем деактивировать самого себя
      if (userId === req.user.id) {
        console.log('User trying to deactivate themselves');
        return res.status(403).json({ error: 'Нельзя деактивировать свою учетную запись' });
      }

      // Деактивируем пользователя
      await User.deactivate(userId);
      
      res.status(200).json({ message: 'Пользователь успешно деактивирован' });
    } catch (error) {
      console.error('Error in deactivateUser:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  /**
   * Активирует учетную запись пользователя
   * 
   * @param {Object} req - Express request объект
   * @param {Object} res - Express response объект
   */
  static async activateUser(req, res) {
    try {
      console.log('Activating user:', req.params.id);
      console.log('Current user:', req.user);

      const userId = parseInt(req.params.id);

      // Получаем пользователя для активации
      const userToActivate = await User.getById(userId);
      if (!userToActivate) {
        console.log('User not found:', userId);
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      console.log('Found user to activate:', userToActivate);

      // Проверяем права на активацию
      // Только владелец может активировать других владельцев
      if (userToActivate.role === 'owner' && req.user.role !== 'owner') {
        console.log('Only owner can activate another owner');
        return res.status(403).json({ error: 'Только владелец может активировать другого владельца' });
      }

      // Админ может активировать пользователей только своей компании
      if (req.user.role === 'admin' && req.user.company_id !== userToActivate.company_id) {
        console.log('Admin can only activate users from the same company');
        return res.status(403).json({ error: 'Админ может активировать только пользователей своей компании' });
      }

      // Активируем пользователя
      await User.activate(userId);
      
      res.status(200).json({ message: 'Пользователь успешно активирован' });
    } catch (error) {
      console.error('Error in activateUser:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
}

module.exports = UserController; 