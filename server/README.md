# Service Task App Backend v2.0.0

## Description
Backup of a fully working backend of the application for managing tasks and tickets.

## Main changes
- All controller tests fixed
- Added explicit status 200 setting for GET requests
- Improved error handling
- All tests pass (86/86)

## Project structure
```
server/
├── src/
│ ├── config/
│ │ └── database.js
│ ├── controllers/
│ │ ├── companyController.js
│ │ ├── userController.js
│ │ └── ticketController.js
│ ├── middleware/
│ │ └── auth.js
│ ├── models/
│ │ ├── company.js
│ │ ├── user.js
│ │ └── tickets.js
│ └── routes/
│ ├── companyRoutes.js
│ ├── userRoutes.js
│ └── ticketRoutes.js
├── tests/
│ ├── api.test.js
│ ├── controllers.test.js
│ ├── middleware.test.js
│ ├── models.test.js
│ └── setup.js
├── package.json
└── server.js
```

## Tests
All tests pass successfully:
- Controller tests: 10/10
- API tests: 29/29
- Model tests: 7/7
- Middleware tests: 10/10

## Installation and launch
1. Installing dependencies:
```bash
npm install
```

2. Starting the server:
```bash
npm start
```

3. Running tests:
```bash
npm test
```

## API Endpoints
### Companies
- GET /api/companies - getting all companies (owner only)
- POST /api/companies - creating a company (owner only)
- GET /api/companies/:id - get company by ID
- GET /api/companies/:id/users - get company users

### Users
- GET /api/users - get all users (owner) or company users (admin)
- POST /api/users - create user
- DELETE /api/users/:id - delete user

### Tickets
- GET /api/tickets - get all company tickets
- POST /api/tickets - create ticket
- ​​DELETE /api/tickets/:id - delete ticket
- ​​PATCH /api/tickets/:id/status - update ticket status
- PATCH /api/tickets/:id/assign - assign ticket

## User roles
- owner - full access to all companies
- admin - access to your company and manage users
- tech_admin - access to your company tickets
- user - basic access to your company tickets



# Service Task App Backend v2.0.0

## Описание
Бэкап полностью рабочего бэкенда приложения для управления задачами и тикетами.

## Основные изменения
- Исправлены все тесты контроллеров
- Добавлена явная установка статуса 200 для GET-запросов
- Улучшена обработка ошибок
- Все тесты проходят успешно (86/86)

## Структура проекта
```
server/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── companyController.js
│   │   ├── userController.js
│   │   └── ticketController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── company.js
│   │   ├── user.js
│   │   └── ticket.js
│   └── routes/
│       ├── companyRoutes.js
│       ├── userRoutes.js
│       └── ticketRoutes.js
├── tests/
│   ├── api.test.js
│   ├── controllers.test.js
│   ├── middleware.test.js
│   ├── models.test.js
│   └── setup.js
├── package.json
└── server.js
```

## Тесты
Все тесты проходят успешно:
- Тесты контроллеров: 10/10
- Тесты API: 29/29
- Тесты моделей: 7/7
- Тесты middleware: 10/10

## Установка и запуск
1. Установка зависимостей:
```bash
npm install
```

2. Запуск сервера:
```bash
npm start
```

3. Запуск тестов:
```bash
npm test
```

## API Endpoints
### Companies
- GET /api/companies - получение всех компаний (только owner)
- POST /api/companies - создание компании (только owner)
- GET /api/companies/:id - получение компании по ID
- GET /api/companies/:id/users - получение пользователей компании

### Users
- GET /api/users - получение всех пользователей (owner) или пользователей компании (admin)
- POST /api/users - создание пользователя
- DELETE /api/users/:id - удаление пользователя

### Tickets
- GET /api/tickets - получение всех тикетов компании
- POST /api/tickets - создание тикета
- DELETE /api/tickets/:id - удаление тикета
- PATCH /api/tickets/:id/status - обновление статуса тикета
- PATCH /api/tickets/:id/assign - назначение тикета

## Роли пользователей
- owner - полный доступ ко всем компаниям
- admin - доступ к своей компании и управление пользователями
- tech_admin - доступ к тикетам своей компании
- user - базовый доступ к тикетам своей компании 