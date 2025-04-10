const { db, runQuery, getRow, getRows } = require('../src/config/database');
const { initApp } = require('../src/server');

// Test data
const TEST_DATA = {
    companies: [
        { id: 1, name: 'Test Company 1' },
        { id: 2, name: 'Test Company 2' }
    ],
    users: [
        { id: 1, email: 'owner@test.com', password: 'password123', role: 'owner', company_id: 1, full_name: 'Test Owner' },
        { id: 2, email: 'admin@test.com', password: 'password123', role: 'admin', company_id: 2, full_name: 'Test Admin' },
        { id: 3, email: 'tech@test.com', password: 'password123', role: 'tech_admin', company_id: 2, full_name: 'Test Tech Admin' },
        { id: 4, email: 'user@test.com', password: 'password123', role: 'user', company_id: 2, full_name: 'Test User' }
    ],
    tickets: [
        {
            id: 1,
            title: 'Test Ticket 1',
            description: 'Test Description 1',
            category: 'bug',
            urgency: 'high',
            status: 'open',
            company_id: 1,
            created_by: 1,
            assigned_role: 'admin',
            comment: 'Initial comment for ticket 1'
        },
        {
            id: 2,
            title: 'Test Ticket 2',
            description: 'Test Description 2',
            category: 'feature',
            urgency: 'medium',
            status: 'in_progress',
            company_id: 2,
            created_by: 4,
            assigned_role: 'tech_admin',
            comment: 'Initial comment for ticket 2'
        }
    ]
};

// Helper function to run SQL queries
const runSQL = async (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
};

// Clear test data
const clearTestData = async () => {
    console.log('\nОчистка тестовых данных...');
    
    try {
        // Disable foreign key checks temporarily
        await runSQL('PRAGMA foreign_keys = OFF');
        
        // Clear tables in reverse order of dependencies
        await runSQL('DELETE FROM tickets');
        await runSQL('DELETE FROM users');
        await runSQL('DELETE FROM companies');
        
        // Reset auto-increment counters
        await runSQL('DELETE FROM sqlite_sequence');
        
        // Re-enable foreign key checks
        await runSQL('PRAGMA foreign_keys = ON');
        
        console.log('Тестовые данные очищены');
    } catch (error) {
        console.error('Error clearing test data:', error);
        throw error;
    }
};

// Initialize test data
const initTestDatabase = async () => {
    console.log('\nИнициализация тестовых данных...');
    
    try {
        // Insert companies
        for (const company of TEST_DATA.companies) {
            await runSQL(
                'INSERT INTO companies (id, name) VALUES (?, ?)',
                [company.id, company.name]
            );
        }
        
        // Insert users
        for (const user of TEST_DATA.users) {
            await runSQL(
                'INSERT INTO users (id, email, password, role, company_id, full_name) VALUES (?, ?, ?, ?, ?, ?)',
                [user.id, user.email, user.password, user.role, user.company_id, user.full_name]
            );
        }
        
        // Insert tickets
        for (const ticket of TEST_DATA.tickets) {
            await runSQL(
                'INSERT INTO tickets (id, title, description, category, urgency, status, company_id, created_by, assigned_role, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    ticket.id,
                    ticket.title,
                    ticket.description,
                    ticket.category,
                    ticket.urgency,
                    ticket.status,
                    ticket.company_id,
                    ticket.created_by,
                    ticket.assigned_role,
                    ticket.comment || null
                ]
            );
        }
        
        console.log('Тестовые данные инициализированы');
    } catch (error) {
        console.error('Error initializing test data:', error);
        throw error;
    }
};

// Global hooks
beforeAll(async () => {
    await clearTestData();
    await initTestDatabase();
});

afterEach(async () => {
    await clearTestData();
    await initTestDatabase();
});

afterAll(async () => {
    await clearTestData();
});

module.exports = {
    TEST_DATA,
    clearTestData,
    initTestDatabase,
    runSQL
}; 