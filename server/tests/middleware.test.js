const { authenticateUser, checkUserRole, checkUserDeletePermission } = require('../src/middleware/auth');
const { getDatabase } = require('../src/config/database');
const { initTestDatabase, clearTestData, TEST_DATA } = require('./setup');

// Мокаем объекты request и response
const mockRequest = (headers = {}, params = {}, user = null) => ({
  headers,
  params,
  header: (name) => headers[name],
  user: user || {}
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const next = jest.fn();

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('should pass with valid user-id header', () => {
      const req = mockRequest({ 'user-id': '1' });
      const res = mockResponse();

      authenticateUser(req, res, next);

      expect(req.userId).toBe(1);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail without user-id header', () => {
      const req = mockRequest({});
      const res = mockResponse();

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Требуется аутентификация' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail with invalid user-id', () => {
      const req = mockRequest({ 'user-id': 'invalid' });
      const res = mockResponse();

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Требуется аутентификация' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('checkUserRole', () => {
    it('should pass with valid user', async () => {
      const req = mockRequest({ 'user-id': '1' });
      const res = mockResponse();

      await checkUserRole(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(1);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail with non-existent user', async () => {
      const req = mockRequest({ 'user-id': '999' });
      const res = mockResponse();

      await checkUserRole(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Пользователь не найден' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('checkUserDeletePermission', () => {
    it('should allow owner to delete any user', async () => {
      const req = mockRequest({ 'user-id': '1' }, { id: '2' }, { role: 'owner', company_id: 1 });
      const res = mockResponse();

      await checkUserDeletePermission(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow admin to delete users in their company', async () => {
      const req = mockRequest({ 'user-id': '2' }, { id: '3' }, { role: 'admin', company_id: 2 });
      const res = mockResponse();

      await checkUserDeletePermission(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should prevent admin from deleting users in other company', async () => {
      const req = mockRequest({ 'user-id': '2' }, { id: '1' }, { role: 'admin', company_id: 2 });
      const res = mockResponse();

      await checkUserDeletePermission(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Cannot delete user from another company' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow tech_admin to delete only users with role "user"', async () => {
      const req = mockRequest({ 'user-id': '3' }, { id: '4' }, { role: 'tech_admin', company_id: 2 });
      const res = mockResponse();

      await checkUserDeletePermission(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should prevent tech_admin from deleting users with other roles', async () => {
      const req = mockRequest({ 'user-id': '3' }, { id: '2' }, { role: 'tech_admin', company_id: 2 });
      const res = mockResponse();

      await checkUserDeletePermission(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Tech Admin может удалять только пользователей с ролью user в своей компании' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should prevent user from deleting any users', async () => {
      const req = mockRequest({ 'user-id': '4' }, { id: '3' }, { role: 'user', company_id: 2 });
      const res = mockResponse();

      await checkUserDeletePermission(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Пользователь не может удалять других пользователей' });
      expect(next).not.toHaveBeenCalled();
    });
  });
}); 