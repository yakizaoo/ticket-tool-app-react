const { db } = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    const { email, password, full_name, company_name } = req.body;

    try {
        // Проверяем, есть ли уже пользователи в системе
        const userCount = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
                if (err) reject(err);
                resolve(row.count);
            });
        });

        // Если это первый пользователь, он автоматически становится администратором
        const isFirstUser = userCount === 0;

        // Создаем компанию
        const company = await new Promise((resolve, reject) => {
            db.run('INSERT INTO companies (name) VALUES (?)', [company_name], function(err) {
                if (err) reject(err);
                resolve({ id: this.lastID });
            });
        });

        // Хешируем пароль перед сохранением
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем пользователя
        const user = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (email, password, full_name, role, company_id) 
                 VALUES (?, ?, ?, ?, ?)`,
                [email, hashedPassword, full_name, isFirstUser ? 'admin' : 'user', company.id],
                function(err) {
                    if (err) reject(err);
                    resolve({ id: this.lastID });
                }
            );
        });

        // Получаем созданного пользователя без пароля
        const createdUser = await new Promise((resolve, reject) => {
            db.get(
                `SELECT u.id, u.email, u.full_name, u.role, u.company_id, c.name as company_name 
                 FROM users u 
                 JOIN companies c ON u.company_id = c.id 
                 WHERE u.id = ?`,
                [user.id],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        res.status(201).json(createdUser);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password });
    console.log('Request body:', req.body);

    try {
        // Получаем всех пользователей для отладки
        const allUsers = await new Promise((resolve, reject) => {
            db.all(
                `SELECT u.*, c.name as company_name
                 FROM users u 
                 LEFT JOIN companies c ON u.company_id = c.id`,
                (err, rows) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(err);
                    }
                    console.log('All users in database:', rows ? rows.map(u => ({ ...u, password: '[REDACTED]' })) : null);
                    resolve(rows);
                }
            );
        });

        // Получаем пользователя по email
        const user = await new Promise((resolve, reject) => {
            db.get(
                `SELECT u.*, c.name as company_name
                 FROM users u 
                 LEFT JOIN companies c ON u.company_id = c.id 
                 WHERE u.email = ?`,
                [email],
                (err, row) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(err);
                    }
                    console.log('Database query result:', row ? { ...row, password: '[REDACTED]' } : null);
                    resolve(row);
                }
            );
        });

        console.log('Found user:', user ? { ...user, password: '[REDACTED]' } : null);

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Проверяем активирована ли учетная запись
        if (user.is_active === 0) {
            console.log('User account is deactivated:', user.id);
            return res.status(401).json({ error: 'Неверный email или пароль (учетная запись деактивирована)' });
        }

        // Проверяем пароль используя bcrypt.compare
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Invalid password');
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Удаляем пароль из ответа
        const { password: _, ...userWithoutPassword } = user;
        
        // Генерируем токен
        const token = jwt.sign(
            { 
                id: user.id,
                email: user.email,
                role: user.role,
                company_id: user.company_id
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('Login successful:', userWithoutPassword);

        res.json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Ошибка при входе в систему' });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await new Promise((resolve, reject) => {
            db.get(
                `SELECT u.id, u.email, u.full_name, u.role, u.company_id, 
                        c.name as company_name
                 FROM users u 
                 LEFT JOIN companies c ON u.company_id = c.id 
                 WHERE u.id = ?`,
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, email } = req.body;

        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET full_name = ?, email = ? WHERE id = ?',
                [full_name, email, userId],
                function(err) {
                    if (err) reject(err);
                    resolve(this.changes);
                }
            );
        });

        const updatedUser = await new Promise((resolve, reject) => {
            db.get(
                `SELECT u.id, u.email, u.full_name, u.role, u.company_id, 
                        c.name as company_name
                 FROM users u 
                 LEFT JOIN companies c ON u.company_id = c.id 
                 WHERE u.id = ?`,
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Ошибка при обновлении данных пользователя' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;

        await new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
                if (err) reject(err);
                resolve(this.changes);
            });
        });

        res.json({ message: 'Пользователь успешно удален' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Ошибка при удалении пользователя' });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    updateUser,
    deleteUser
}; 