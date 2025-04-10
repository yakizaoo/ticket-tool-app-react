const authMiddleware = (req, res, next) => {
  const userId = req.headers['user-id'];
  
  if (!userId) {
    return res.status(401).json({ message: 'Необходима аутентификация' });
  }

  // Добавляем userId в объект запроса для использования в контроллерах
  req.user = { id: userId };
  next();
};

module.exports = authMiddleware; 