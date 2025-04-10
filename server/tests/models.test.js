const Company = require('../src/models/company');
const User = require('../src/models/user');
const Ticket = require('../src/models/ticket');
const { initTestDatabase, clearTestData, TEST_DATA } = require('./setup');

describe('Company Model', () => {
  beforeEach(async () => {
    await clearTestData();
    await initTestDatabase();
  });

  test('should create a new company', async () => {
    const companyId = await Company.create('Test Company');
    expect(companyId).toBeDefined();
    expect(typeof companyId).toBe('number');

    const company = await Company.getById(companyId);
    expect(company).toBeDefined();
    expect(company.name).toBe('Test Company');
  });

  test('should get all companies', async () => {
    const companies = await Company.getAll();
    expect(companies).toHaveLength(2);
    expect(companies.map(c => c.name)).toEqual(['Test Company 1', 'Test Company 2']);
  });
});

describe('User Model', () => {
  beforeEach(async () => {
    await clearTestData();
    await initTestDatabase();
  });

  test('should create a new user', async () => {
    const userId = await User.create({
      email: 'test@example.com',
      password: 'password',
      full_name: 'Test User',
      role: 'user',
      company_id: 1
    });

    expect(userId).toBeDefined();
    expect(typeof userId).toBe('number');

    const user = await User.getById(userId);
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('user');
  });

  test('should get users by company', async () => {
    const users = await User.getByCompany(2);
    expect(users).toHaveLength(3);
    expect(users.every(u => u.company_id === 2)).toBeTruthy();
  });
});

describe('Ticket Model', () => {
  beforeEach(async () => {
    await clearTestData();
    await initTestDatabase();
  });

  describe('create', () => {
    it('should create a new ticket', async () => {
      const ticketData = {
        title: 'Test Ticket',
        description: 'Test Description',
        category: 'bug',
        urgency: 'high',
        company_id: 1,
        created_by: 1
      };

      const ticket = await Ticket.create(ticketData);
      expect(ticket).toBeDefined();
      expect(ticket.id).toBeDefined();
      expect(ticket.title).toBe(ticketData.title);
      expect(ticket.description).toBe(ticketData.description);
      expect(ticket.category).toBe(ticketData.category);
      expect(ticket.urgency).toBe(ticketData.urgency);
      expect(ticket.company_id).toBe(ticketData.company_id);
      expect(ticket.created_by).toBe(ticketData.created_by);
    });

    it('should throw error if company does not exist', async () => {
      const ticketData = {
        title: 'New Test Ticket',
        description: 'New Test Description',
        category: 'bug',
        urgency: 'high',
        company_id: 999, // Несуществующая компания
        created_by: 1
      };

      await expect(Ticket.create(ticketData)).rejects.toThrow('Компания не найдена');
    });

    it('should throw error if creator does not exist', async () => {
      const ticketData = {
        title: 'New Test Ticket',
        description: 'New Test Description',
        category: 'bug',
        urgency: 'high',
        company_id: 1,
        created_by: 999 // Несуществующий пользователь
      };

      await expect(Ticket.create(ticketData)).rejects.toThrow('Пользователь не найден');
    });
  });

  describe('getById', () => {
    it('should return ticket by id', async () => {
      const ticket = await Ticket.getById(1);
      expect(ticket).toBeDefined();
      expect(ticket.id).toBe(1);
      expect(ticket.title).toBe('Test Ticket 1');
      expect(ticket.creator_email).toBe('owner@test.com');
    });

    it('should return null for non-existent ticket', async () => {
      const ticket = await Ticket.getById(999);
      expect(ticket).toBeNull();
    });
  });

  describe('getByCompany', () => {
    it('should return all tickets for company', async () => {
      const tickets = await Ticket.getByCompany(1);
      expect(tickets).toHaveLength(1);
      expect(tickets[0].company_id).toBe(1);
    });

    it('should filter tickets by status', async () => {
      const tickets = await Ticket.getByCompany(2, { status: 'in_progress' });
      expect(tickets).toHaveLength(1);
      expect(tickets[0].status).toBe('in_progress');
    });
  });

  describe('updateStatus', () => {
    it('should update ticket status', async () => {
      await Ticket.updateStatus(1, 'in_progress');
      const ticket = await Ticket.getById(1);
      expect(ticket.status).toBe('in_progress');
    });

    it('should throw error for non-existent ticket', async () => {
      await expect(Ticket.updateStatus(999, 'in_progress')).rejects.toThrow('Тикет не найден');
    });
  });

  describe('delete', () => {
    it('should delete ticket', async () => {
      await Ticket.delete(1);
      const ticket = await Ticket.getById(1);
      expect(ticket).toBeNull();
    });

    it('should throw error for non-existent ticket', async () => {
      await expect(Ticket.delete(999)).rejects.toThrow('Тикет не найден');
    });
  });
}); 