const request = require('supertest');
const express = require('express');
const { initTestDatabase, clearTestData, TEST_DATA } = require('./setup');
const companyRoutes = require('../src/routes/companyRoutes');
const userRoutes = require('../src/routes/userRoutes');
const ticketRoutes = require('../src/routes/ticketRoutes');
const Company = require('../src/models/company');
const User = require('../src/models/user');
const Ticket = require('../src/models/ticket');

// Импортируем и настраиваем приложение
const { app, initApp } = require('../src/server');

// Тестовые данные для удобства
const testUsers = {
  owner: TEST_DATA.users[0],
  admin: TEST_DATA.users[1],
  techAdmin: TEST_DATA.users[2],
  user: TEST_DATA.users[3]
};

const testTickets = {
  ticket1: TEST_DATA.tickets[0],
  ticket2: TEST_DATA.tickets[1]
};

// Вспомогательная функция для создания заголовков с user-id
const createHeaders = (userId) => ({
  'user-id': userId.toString()
});

describe('API Tests', () => {
  beforeAll(async () => {
    await initApp();
  });

  beforeEach(async () => {
    await clearTestData();
    await initTestDatabase();
  });

  // Тесты для компаний
  describe('Companies API', () => {
    test('GET /api/companies - owner can get all companies', async () => {
      const response = await request(app)
        .get('/api/companies')
        .set(createHeaders(testUsers.owner.id));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body).toHaveLength(2);
    });

    test('GET /api/companies - non-owner cannot get companies', async () => {
      const response = await request(app)
        .get('/api/companies')
        .set(createHeaders(testUsers.admin.id));

      expect(response.status).toBe(403);
    });

    test('POST /api/companies - owner can create company', async () => {
      const response = await request(app)
        .post('/api/companies')
        .set(createHeaders(testUsers.owner.id))
        .send({ name: 'New Company' });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Company');
    });

    test('POST /api/companies - non-owner cannot create company', async () => {
      const response = await request(app)
        .post('/api/companies')
        .set(createHeaders(testUsers.admin.id))
        .send({ name: 'New Company' });

      expect(response.status).toBe(403);
    });
  });

  // Тесты для пользователей
  describe('Users API', () => {
    test('GET /api/users - owner can get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set(createHeaders(testUsers.owner.id));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body).toHaveLength(4);
    });

    test('GET /api/users - non-owner can only get users from their company', async () => {
      const response = await request(app)
        .get('/api/users')
        .set(createHeaders(testUsers.admin.id));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.every(user => user.company_id === testUsers.admin.company_id)).toBeTruthy();
    });

    test('POST /api/users - owner can create user in any company', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(createHeaders(testUsers.owner.id))
        .send({
          email: 'new@test.com',
          password: 'password',
          full_name: 'New User',
          role: 'user',
          company_id: 2
        });

      expect(response.status).toBe(201);
      expect(response.body.email).toBe('new@test.com');
    });

    test('POST /api/users - admin can only create user in their company', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(createHeaders(testUsers.admin.id))
        .send({
          email: 'new@test.com',
          password: 'password',
          full_name: 'New User',
          role: 'user',
          company_id: 1
        });

      expect(response.status).toBe(403);
    });

    test('POST /api/users - admin can create admin user', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(createHeaders(testUsers.admin.id))
        .send({
          email: 'newadmin@test.com',
          password: 'password',
          full_name: 'New Admin',
          role: 'admin',
          company_id: 2
        });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('admin');
    });

    test('POST /api/users - admin can create tech_admin user', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(createHeaders(testUsers.admin.id))
        .send({
          email: 'newtech@test.com',
          password: 'password',
          full_name: 'New Tech Admin',
          role: 'tech_admin',
          company_id: 2
        });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('tech_admin');
    });

    test('POST /api/users - admin can create user', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(createHeaders(testUsers.admin.id))
        .send({
          email: 'newuser@test.com',
          password: 'password',
          full_name: 'New User',
          role: 'user',
          company_id: 2
        });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('user');
    });

    test('POST /api/users - admin cannot create owner', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(createHeaders(testUsers.admin.id))
        .send({
          email: 'newowner@test.com',
          password: 'password',
          full_name: 'New Owner',
          role: 'owner',
          company_id: 2
        });

      expect(response.status).toBe(403);
    });

    test('POST /api/users - tech_admin can create user', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(createHeaders(testUsers.techAdmin.id))
        .send({
          email: 'newuser@test.com',
          password: 'password',
          full_name: 'New User',
          role: 'user',
          company_id: 2
        });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('user');
    });

    test('POST /api/users - tech_admin cannot create admin', async () => {
      const response = await request(app)
        .post('/api/users')
        .set(createHeaders(testUsers.techAdmin.id))
        .send({
          email: 'newadmin@test.com',
          password: 'password',
          full_name: 'New Admin',
          role: 'admin',
          company_id: 2
        });

      expect(response.status).toBe(403);
    });

    test('DELETE /api/users/:id - owner can delete any user', async () => {
      // Сначала удаляем тикет, созданный пользователем
      await request(app)
        .delete(`/api/tickets/${testTickets.ticket2.id}`)
        .set(createHeaders(testUsers.owner.id));

      const response = await request(app)
        .delete(`/api/users/${testUsers.user.id}`)
        .set(createHeaders(testUsers.owner.id));

      expect(response.status).toBe(200);
    });

    test('DELETE /api/users/:id - admin can only delete users in their company', async () => {
      // Сначала удаляем тикет, созданный пользователем
      await request(app)
        .delete(`/api/tickets/${testTickets.ticket2.id}`)
        .set(createHeaders(testUsers.admin.id));

      const response = await request(app)
        .delete(`/api/users/${testUsers.user.id}`)
        .set(createHeaders(testUsers.admin.id));

      expect(response.status).toBe(200);
    });

    test('DELETE /api/users/:id - admin cannot delete users from other company', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUsers.owner.id}`)
        .set(createHeaders(testUsers.admin.id));

      expect(response.status).toBe(403);
    });

    test('DELETE /api/users/:id - tech_admin can only delete users', async () => {
      // Сначала удаляем тикет, созданный пользователем
      await request(app)
        .delete(`/api/tickets/${testTickets.ticket2.id}`)
        .set(createHeaders(testUsers.techAdmin.id));

      const response = await request(app)
        .delete(`/api/users/${testUsers.user.id}`)
        .set(createHeaders(testUsers.techAdmin.id));

      expect(response.status).toBe(200);
    });

    test('DELETE /api/users/:id - tech_admin cannot delete admin', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUsers.admin.id}`)
        .set(createHeaders(testUsers.techAdmin.id));

      expect(response.status).toBe(403);
    });

    test('DELETE /api/users/:id - tech_admin cannot delete users from other company', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUsers.owner.id}`)
        .set(createHeaders(testUsers.techAdmin.id));

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Tech Admin может удалять только пользователей с ролью user в своей компании');
    });
  });

  // Тесты для тикетов
  describe('Tickets API', () => {
    test('GET /api/tickets - owner can see all tickets including hidden', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .set(createHeaders(testUsers.owner.id));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });

    test('GET /api/tickets - user can only see their own tickets', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .set(createHeaders(testUsers.user.id));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.every(ticket => ticket.created_by === testUsers.user.id)).toBeTruthy();
    });

    test('PATCH /api/tickets/:id/status - user can only archive their own tickets', async () => {
      const response = await request(app)
        .patch(`/api/tickets/${testTickets.ticket2.id}/status`)
        .set(createHeaders(testUsers.user.id))
        .send({
          status: 'archived',
          comment: 'Тест архивации'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Статус тикета обновлен');
    });

    test('PATCH /api/tickets/:id/status - user cannot delete their tickets', async () => {
      const response = await request(app)
        .patch(`/api/tickets/${testTickets.ticket2.id}/status`)
        .set(createHeaders(testUsers.user.id))
        .send({
          status: 'hidden',
          comment: 'Тест удаления'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Пользователь может только архивировать свои тикеты');
    });

    test('PATCH /api/tickets/:id/status - tech_admin can only archive tickets', async () => {
      const response = await request(app)
        .patch(`/api/tickets/${testTickets.ticket2.id}/status`)
        .set(createHeaders(testUsers.techAdmin.id))
        .send({
          status: 'archived',
          comment: 'Тест архивации'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Статус тикета обновлен');
    });

    test('PATCH /api/tickets/:id/status - tech_admin cannot delete tickets', async () => {
      const response = await request(app)
        .patch(`/api/tickets/${testTickets.ticket2.id}/status`)
        .set(createHeaders(testUsers.techAdmin.id))
        .send({
          status: 'hidden',
          comment: 'Тест удаления'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Tech Admin может только архивировать тикеты');
    });

    test('DELETE /api/tickets/:id - only owner can delete tickets', async () => {
      const response = await request(app)
        .delete(`/api/tickets/${testTickets.ticket2.id}`)
        .set(createHeaders(testUsers.owner.id))
        .send({
          comment: 'Тест удаления'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Тикет успешно удален');
    });

    test('DELETE /api/tickets/:id - non-owner cannot delete tickets', async () => {
      const response = await request(app)
        .delete(`/api/tickets/${testTickets.ticket2.id}`)
        .set(createHeaders(testUsers.admin.id))
        .send({
          comment: 'Тест удаления'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Только owner может удалять тикеты');
    });

    test('PATCH /api/tickets/:id/status - requires comment', async () => {
      const response = await request(app)
        .patch(`/api/tickets/${testTickets.ticket2.id}/status`)
        .set(createHeaders(testUsers.user.id))
        .send({
          status: 'archived'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Необходимо указать комментарий');
    });

    test('DELETE /api/tickets/:id - requires comment', async () => {
      const response = await request(app)
        .delete(`/api/tickets/${testTickets.ticket2.id}`)
        .set(createHeaders(testUsers.owner.id))
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Необходимо указать комментарий');
    });
  });
}); 