const { getDatabase } = require('../src/config/database');
const CompanyController = require('../src/controllers/companyController');
const UserController = require('../src/controllers/userController');
const TicketController = require('../src/controllers/ticketController');
const Company = require('../src/models/company');
const User = require('../src/models/user');
const Ticket = require('../src/models/ticket');
const { initTestDatabase, clearTestData, TEST_DATA } = require('./setup');

// Мокаем объекты request и response
const mockRequest = (body = {}, params = {}, user = {}, query = {}) => ({
  body,
  params,
  user,
  query
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

beforeEach(async () => {
  await clearTestData();
  await initTestDatabase();
});

afterAll(async () => {
  await clearTestData();
});

describe('CompanyController', () => {
  test('should get all companies', async () => {
    const req = mockRequest({}, {}, { role: 'owner' });
    const res = mockResponse();

    await CompanyController.getAll(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('should get company by id', async () => {
    const req = mockRequest({}, { id: '1' }, { role: 'owner' });
    const res = mockResponse();

    await CompanyController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('should create company', async () => {
    const req = mockRequest({ name: 'New Test Company' }, {}, { role: 'owner' });
    const res = mockResponse();

    await CompanyController.create(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });
});

describe('UserController', () => {
  test('should get all users (owner)', async () => {
    const req = mockRequest({}, {}, { role: 'owner' });
    const res = mockResponse();

    await UserController.getAll(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('should get company users (admin)', async () => {
    const req = mockRequest({}, {}, { role: 'admin', company_id: 2 });
    const res = mockResponse();

    await UserController.getAll(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('should create user', async () => {
    const req = mockRequest({
      email: 'newuser@test.com',
      password: 'password',
      full_name: 'New User',
      role: 'user',
      company_id: 2
    }, {}, { role: 'admin', company_id: 2 });
    const res = mockResponse();

    await UserController.create(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });
});

describe('TicketController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: {},
      userId: 1
    };
    res = mockResponse();
  });

  describe('getAll', () => {
    it('should get all tickets for owner', async () => {
      req.user.role = 'owner';
      req.query = {};

      await TicketController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should get only user tickets for user role', async () => {
      req.user.role = 'user';
      req.user.id = 4; // ID пользователя из тестовых данных
      req.query = {};

      await TicketController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new ticket', async () => {
      const ticketData = {
        title: 'Test Ticket',
        description: 'Test Description',
        category: 'bug',
        urgency: 'high',
        company_id: 1,
        created_by: 1,
        assigned_role: 'admin'
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
      expect(ticket.assigned_role).toBe(ticketData.assigned_role);
    });

    it('should create ticket without assigned role', async () => {
      req.body = {
        title: 'Test Ticket',
        description: 'Test Description',
        category: 'bug',
        urgency: 'high',
        company_id: 1
      };
      req.user.role = 'user';
      req.user.company_id = 1;
      req.userId = 4;

      await TicketController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      req.body = {
        title: 'Test Ticket'
      };

      await TicketController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Не все обязательные поля заполнены' });
    });

    it('should validate assigned role', async () => {
      console.log('Starting assigned role validation test');
      
      req = mockRequest({
        title: 'Test Ticket',
        description: 'Test Description',
        category: 'bug',
        urgency: 'high',
        company_id: 1,
        assigned_role: 'invalid_role'
      }, {}, { role: 'user', company_id: 1 });
      req.userId = 4;
      
      console.log('Test request body:', req.body);
      console.log('Test user context:', { userId: req.userId, user: req.user });

      await TicketController.create(req, res);
      
      console.log('Response status calls:', res.status.mock.calls);
      console.log('Response json calls:', res.json.mock.calls);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Недопустимая роль. Разрешены только admin и tech_admin' });
    });
  });

  describe('delete', () => {
    it('should delete ticket (make it hidden)', async () => {
      req.params.id = 1;
      req.body.comment = 'Тест удаления';
      req.user.role = 'owner';
      req.userId = 1;

      await TicketController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Тикет успешно удален' });
    });

    it('should check permissions', async () => {
      req.params.id = 1;
      req.body.comment = 'Тест удаления';
      req.user.role = 'admin';

      await TicketController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Только owner может удалять тикеты' });
    });

    it('should require comment', async () => {
      req.params.id = 1;
      req.user.role = 'owner';

      await TicketController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Необходимо указать комментарий' });
    });
  });

  describe('updateStatus', () => {
    it('should update ticket status', async () => {
      req.params.id = 1;
      req.body = {
        status: 'archived',
        comment: 'Тест'
      };
      req.user.role = 'user';
      req.userId = 1;

      await TicketController.updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent ticket', async () => {
      req.params.id = 999;
      req.body = {
        status: 'archived',
        comment: 'Тест'
      };
      req.user.role = 'user';
      req.userId = 1;

      await TicketController.updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Тикет не найден' });
    });
  });
});

describe('Ticket Model', () => {
  describe('create', () => {
    test('should create a new ticket', async () => {
      const ticketData = {
        title: 'New Ticket',
        description: 'Test Description',
        category: 'bug',
        urgency: 'high',
        company_id: 1,
        created_by: 1
      };

      const ticket = await Ticket.create(ticketData);
      expect(ticket).toBeDefined();
      expect(ticket.id).toBeDefined();
      expect(typeof ticket.id).toBe('number');

      const fetchedTicket = await Ticket.getById(ticket.id);
      expect(fetchedTicket).toBeDefined();
      expect(fetchedTicket.title).toBe(ticketData.title);
      expect(fetchedTicket.description).toBe(ticketData.description);
      expect(fetchedTicket.category).toBe(ticketData.category);
      expect(fetchedTicket.urgency).toBe(ticketData.urgency);
      expect(fetchedTicket.company_id).toBe(ticketData.company_id);
      expect(fetchedTicket.created_by).toBe(ticketData.created_by);
      expect(fetchedTicket.status).toBe('open');
    });

    test('should throw error if company does not exist', async () => {
      const ticketData = {
        title: 'New Ticket',
        description: 'Test Description',
        category: 'bug',
        urgency: 'high',
        company_id: 999,
        created_by: 1
      };

      await expect(Ticket.create(ticketData)).rejects.toThrow('Компания не найдена');
    });

    test('should throw error if creator does not exist', async () => {
      const ticketData = {
        title: 'New Ticket',
        description: 'Test Description',
        category: 'bug',
        urgency: 'high',
        company_id: 1,
        created_by: 999
      };

      await expect(Ticket.create(ticketData)).rejects.toThrow('Пользователь не найден');
    });
  });

  describe('getById', () => {
    test('should return ticket by id', async () => {
      const ticket = await Ticket.getById(TEST_DATA.tickets[0].id);
      expect(ticket).toBeDefined();
      expect(ticket.id).toBe(TEST_DATA.tickets[0].id);
      expect(ticket.title).toBe(TEST_DATA.tickets[0].title);
      expect(ticket.description).toBe(TEST_DATA.tickets[0].description);
      expect(ticket.category).toBe(TEST_DATA.tickets[0].category);
      expect(ticket.urgency).toBe(TEST_DATA.tickets[0].urgency);
      expect(ticket.status).toBe(TEST_DATA.tickets[0].status);
      expect(ticket.company_id).toBe(TEST_DATA.tickets[0].company_id);
      expect(ticket.created_by).toBe(TEST_DATA.tickets[0].created_by);
      expect(ticket.creator_email).toBeDefined();
    });

    test('should return null for non-existent ticket', async () => {
      const ticket = await Ticket.getById(999);
      expect(ticket).toBeNull();
    });
  });

  describe('getByCompany', () => {
    test('should return all tickets for company', async () => {
      const tickets = await Ticket.getByCompany(2);
      expect(Array.isArray(tickets)).toBeTruthy();
      expect(tickets.length).toBeGreaterThan(0);
      expect(tickets.every(t => t.company_id === 2)).toBeTruthy();
    });

    test('should filter tickets by status', async () => {
      const tickets = await Ticket.getByCompany(2, { status: 'in_progress' });
      expect(Array.isArray(tickets)).toBeTruthy();
      expect(tickets.every(t => t.status === 'in_progress')).toBeTruthy();
    });
  });

  describe('updateStatus', () => {
    test('should update ticket status', async () => {
      await Ticket.updateStatus(TEST_DATA.tickets[0].id, 'closed');
      const ticket = await Ticket.getById(TEST_DATA.tickets[0].id);
      expect(ticket.status).toBe('closed');
    });

    test('should throw error for non-existent ticket', async () => {
      await expect(Ticket.updateStatus(999, 'closed')).rejects.toThrow('Тикет не найден');
    });
  });

  describe('delete', () => {
    test('should delete ticket', async () => {
      await Ticket.delete(TEST_DATA.tickets[0].id);
      const ticket = await Ticket.getById(TEST_DATA.tickets[0].id);
      expect(ticket).toBeNull();
    });

    test('should throw error for non-existent ticket', async () => {
      await expect(Ticket.delete(999)).rejects.toThrow('Тикет не найден');
    });
  });
}); 