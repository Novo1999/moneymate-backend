# moneymate-backend

Moneymate is a personal finance tracker application built with TypeScript, Express, and PostgreSQL. This backend provides RESTful APIs for user authentication, transaction management, category tracking, and account management.

## Table of Contents
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)

## Architecture

Moneymate backend follows a layered architecture pattern:

### Layered Architecture
```
┌─────────────────────────────────────────┐
│         API Layer (Routers)             │
│  (src/router.ts & src/controllers/)     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Middleware Layer                    │
│  (src/middleware/)                      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│      Controller Layer                   │
│  (src/controllers/)                     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│      Data Access Layer (TypeORM)        │
│  (src/database/postgresql/)             │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│      Database Layer (PostgreSQL)        │
└─────────────────────────────────────────┘
```

### Key Architectural Components

#### 1. **API Layer**
Defined in [router.ts](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/router.ts), sets up all RESTful API routes grouped by functionality:
- User & Auth routes (`/api/v1/auth`)
- Transaction routes (`/api/v1/transaction`)
- Category routes (`/api/v1/categories`)
- AccountType routes (`/api/v1/accountType`)
- KeepAlive route (`/api/v1/keepAlive`)

#### 2. **Middleware Layer**
Located in [middleware/](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/middleware/), provides:
- [Authentication middleware](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/middleware/authMiddleware.ts) - JWT verification
- [Validation middleware](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/middleware/validationMiddleware.ts) - input validation

#### 3. **Controller Layer**
The [controllers/](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/controllers/) directory contains all the business logic:
- User & Auth handling ([user.controller.ts](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/controllers/user.controller.ts))
- Transaction management ([transaction.controller.ts](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/controllers/transaction.controller.ts))
- Category management ([category.controller.ts](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/controllers/category.controller.ts))
- AccountType management ([accountType.controller.ts](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/controllers/accountType.controller.ts))
- Token refresh ([refreshToken.controller.ts](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/controllers/refreshToken.controller.ts))

#### 4. **Data Access Layer**
Built with TypeORM, located in [database/postgresql/](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/database/postgresql/):
- **Entities**: Represent database tables:
  - [User](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/database/postgresql/entity/user.entity.ts)
  - [Transaction](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/database/postgresql/entity/transaction.entity.ts)
  - [Category](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/database/postgresql/entity/category.entity.ts)
  - [AccountType](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/database/postgresql/entity/accountType.entity.ts)
  - [RefreshToken](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/database/postgresql/entity/refreshtoken.entity.ts)
  - [KeepAlive](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/database/postgresql/entity/keepalive.entity.ts)
- **Connection**: [typeorm.ts](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/database/postgresql/typeorm.ts) handles database connectivity and provides repository access

#### 5. **Utility & Enum Layers**
- [util/](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/util/): Helper functions for responses and error handling
- [enums/](file:///e:/Web%20Dev%20-%20Resource/moneymate-backend/src/enums/): Defines enums for transaction types, currencies, and days of the week

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Date Handling**: date-fns
- **Google Sign-in**: google-auth-library

## Project Structure

```
moneymate-backend/
├── src/
│   ├── controllers/          # Request handlers with business logic
│   ├── database/
│   │   └── postgresql/
│   │       ├── entity/       # TypeORM entities
│   │       └── typeorm.ts    # DB connection setup
│   ├── enums/                # Enum definitions
│   ├── middleware/           # Express middleware
│   ├── migration/            # Database migrations
│   ├── util/                 # Utility functions & interfaces
│   ├── app.ts                # Express app initialization
│   ├── init.ts               # App setup (DB connect + server start)
│   ├── router.ts             # API routes configuration
│   ├── security.ts           # Security middleware (CORS, etc.)
│   └── seed.ts               # Database seeding
├── data-source.ts            # TypeORM data source for CLI
├── package.json
├── tsconfig.json
└── README.md
```

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory (see [Environment Variables](#environment-variables))
4. Run database migrations:
   ```bash
   npm run migration:run
   ```
5. (Optional) Seed the database:
   ```bash
   npm run seed
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server
BASE_URL=http://localhost:3000

# PostgreSQL
PGSQL_HOST=localhost
PGSQL_PORT=5432
PGSQL_USERNAME=your_username
PGSQL_PASSWORD=your_password
PGSQL_DATABASE=moneymate

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Google Auth (optional)
GOOGLE_CLIENT_ID=your_google_client_id,your_ios_client_id
```

## Available Scripts

- `npm run dev`: Start development server with nodemon
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Start production server
- `npm run migration:generate`: Generate new migration from entity changes
- `npm run migration:create`: Create empty migration file
- `npm run migration:run`: Run pending migrations
- `npm run migration:revert`: Revert last migration
- `npm run migration:show`: Show migration status
- `npm run seed`: Seed database
- `npm run db:reset`: Reset database (revert, migrate, seed)

## API Endpoints

### Authentication & User
- `POST /api/v1/auth/signUp` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/google` - Google sign-in
- `GET /api/v1/auth/me` - Get current user (protected)
- `PATCH /api/v1/auth/user/:id` - Update user data
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refreshToken` - Refresh access token

### Transactions
- `GET /api/v1/transaction/all` - Get all transactions (protected)
- `GET /api/v1/transaction/paginated` - Get paginated transactions (protected)
- `GET /api/v1/transaction/amount-range` - Get max transaction amount (protected)
- `GET /api/v1/transaction/:userId` - Get user transactions (protected)
- `GET /api/v1/transaction/info` - Get transaction info (protected)
- `POST /api/v1/transaction/add` - Add transaction (protected)
- `PATCH /api/v1/transaction/edit/:id` - Edit transaction (protected)
- `DELETE /api/v1/transaction/delete/:id` - Delete transaction (protected)

### Categories
- `GET /api/v1/categories` - Get user categories (protected)
- `POST /api/v1/categories/add` - Add category (protected)
- `PATCH /api/v1/categories/edit/:id` - Edit category (protected)
- `DELETE /api/v1/categories/delete/:id` - Delete category (protected)

### Account Types
- `GET /api/v1/accountType` - Get user account types (protected)
- `GET /api/v1/accountType/:id` - Get account type (protected)
- `POST /api/v1/accountType/add` - Add account type (protected)
- `PATCH /api/v1/accountType/edit/:id` - Edit account type (protected)
- `PATCH /api/v1/accountType/transfer` - Transfer balance (protected)
- `DELETE /api/v1/accountType/delete/:id` - Delete account type (protected)

### Keep Alive
- `GET /api/v1/keepAlive` - Health check endpoint
