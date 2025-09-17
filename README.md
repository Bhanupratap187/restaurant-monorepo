# Restaurant Management System

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

A comprehensive restaurant management system built with Nx monorepo architecture, featuring role-based dashboards and microservices for complete restaurant operations management.

## 🏗️ System Architecture

This monorepo contains multiple applications and shared libraries that work together to provide a complete restaurant management solution:

### Applications

- **🔧 API** (`api/`) - Express.js backend API serving all restaurant operations
- **👨‍💼 Owner Dashboard** (`owner-dashboard/`) - React application for restaurant owners and managers
- **👨‍🍳 Staff Dashboard** (`staff-dashboard/`) - React application for kitchen staff and waiters
- **🧪 API E2E Tests** (`api-e2e/`) - End-to-end testing for the API

### Shared Libraries

- **📝 Shared Types** (`shared-types/`) - TypeScript definitions for all domain entities
- **🎨 Shared UI** (`shared-ui/`) - Reusable React components across dashboards
- **🌐 API Client** (`api-client/`) - Client library for API communication
- **🔐 RBAC** (`rbac/`) - Role-based access control system
- **💾 Database** (`database/`) - Database models and utilities

## 🍽️ Restaurant Domain Features

### Order Management

- **Order Processing**: Complete order lifecycle from creation to completion
- **Status Tracking**: Real-time order status updates (`pending` → `preparing` → `ready` → `served`)
- **Table Management**: Table-based order organization
- **Kitchen Integration**: Direct communication between front-of-house and kitchen staff

### Menu Management

- **Dynamic Menu**: Full menu CRUD operations with categories
- **Pricing Control**: Flexible pricing and special offers
- **Inventory Tracking**: Menu item availability management
- **Allergen Information**: Complete allergen tracking for customer safety

### Staff Management & RBAC

- **Role-Based Access**: Four distinct user roles with specific permissions
  - **Owner**: Full system access (reports, staff management, payments)
  - **Manager**: Operational management (orders, reports, payments)
  - **Chef**: Kitchen operations (view/update order status)
  - **Waiter**: Customer-facing operations (orders, customer data)

### Business Intelligence

- **Reporting Dashboard**: Sales, performance, and operational reports
- **Customer Data**: Customer preferences and order history
- **Payment Processing**: Integrated payment management system

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript, Tailwind CSS, React Router
- **Backend**: Node.js with Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Build System**: Nx for monorepo management
- **Testing**: Jest for unit tests, Cypress for E2E tests
- **Type Safety**: Full TypeScript coverage across all packages
- **Validation**: Zod for runtime type validation
- **Security**: Helmet for API security, CORS configuration

## 🚀 Installation & Setup

### Prerequisites

```bash
# Check your Node.js version (v18+ required)
node --version

# Check npm version
npm --version

# Install MongoDB (if running locally)
# macOS
brew install mongodb-community

# Ubuntu/Debian
sudo apt install mongodb

# Or use MongoDB Atlas (cloud) - recommended for development
```

### Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd restaurant-monorepo

# Install all dependencies
npm install

# Or using yarn
yarn install

# Install global Nx CLI (optional but recommended)
npm install -g nx
```

## 🔧 Build Commands

### Build All Projects

```bash
# Build all applications and libraries
npx nx run-many -t build

# Build with production optimization
npx nx run-many -t build --prod

# Build specific projects only
npx nx run-many -t build --projects=api,owner-dashboard,staff-dashboard
```

### Build Individual Projects

```bash
# Build API server
npx nx build api
npx nx build api --prod  # Production build

# Build Owner Dashboard
npx nx build owner-dashboard
npx nx build owner-dashboard --prod  # Production build

# Build Staff Dashboard
npx nx build staff-dashboard
npx nx build staff-dashboard --prod  # Production build

# Build shared libraries
npx nx build shared-types
npx nx build shared-ui
npx nx build api-client
npx nx build rbac
npx nx build database
```

## 🏃‍♂️ Running Applications

### Development Mode (with hot reload)

```bash
# Start all applications concurrently (recommended)
npm run dev  # If script exists, or use individual commands below

# Start API server (PORT: 3000)
npx nx serve api

# Start Owner Dashboard (PORT: 4200)
npx nx serve owner-dashboard

# Start Staff Dashboard (PORT: 4201)
npx nx serve staff-dashboard

# Start with custom port
npx nx serve api --port 3001
npx nx serve owner-dashboard --port 4300
```

### Production Mode

```bash
# Build and serve API in production
npx nx build api --prod
npx nx serve api --prod

# Build and preview dashboards
npx nx build owner-dashboard --prod
npx nx preview owner-dashboard

npx nx build staff-dashboard --prod
npx nx preview staff-dashboard

# Or serve built files with static server
npx serve owner-dashboard/dist
npx serve staff-dashboard/dist
```

### Using PM2 for Production (recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start API with PM2
pm2 start api/dist/main.js --name "restaurant-api"

# Start with environment variables
pm2 start api/dist/main.js --name "restaurant-api" --env production

# Monitor applications
pm2 list
pm2 logs
pm2 monit
```

## 🧪 Testing Commands

### Unit Tests

```bash
# Run all unit tests
npx nx run-many -t test

# Run tests for specific project
npx nx test api
npx nx test shared-types
npx nx test shared-ui

# Run tests in watch mode
npx nx test api --watch
npx nx test shared-ui --watch

# Run tests with coverage
npx nx test api --coverage
npx nx run-many -t test --coverage
```

### End-to-End Tests

```bash
# Run API E2E tests
npx nx e2e api-e2e

# Run Owner Dashboard E2E tests
npx nx e2e owner-dashboard-e2e

# Run Staff Dashboard E2E tests
npx nx e2e staff-dashboard-e2e

# Run E2E tests in headless mode
npx nx e2e owner-dashboard-e2e --headless

# Open Cypress Test Runner
npx nx open-cypress owner-dashboard-e2e
```

### Component Testing

```bash
# Run component tests with Cypress
npx nx component-test shared-ui
npx nx component-test owner-dashboard
```

## 🛠️ Development Commands

### Code Quality

```bash
# Lint all projects
npx nx run-many -t lint

# Lint specific project
npx nx lint api
npx nx lint owner-dashboard

# Auto-fix linting issues
npx nx lint api --fix
npx nx run-many -t lint --fix

# Format code with Prettier
npx nx format:write

# Check formatting
npx nx format:check
```

### Type Checking

```bash
# Type check all projects
npx nx run-many -t typecheck

# Type check specific project
npx nx typecheck api
npx nx typecheck shared-types

# Type check in watch mode
npx nx typecheck api --watch
```

### Dependency Management

```bash
# Analyze project dependencies
npx nx graph

# Show what's affected by changes
npx nx affected:graph

# Run tasks only on affected projects
npx nx affected:build
npx nx affected:test
npx nx affected:lint

# Update TypeScript project references
npx nx sync

# Check if project references are up to date
npx nx sync:check
```

## 🚀 Deployment Commands

### Docker Deployment

```bash
# Build Docker images (if Dockerfiles exist)
docker build -t restaurant-api ./api
docker build -t restaurant-owner-dashboard ./owner-dashboard
docker build -t restaurant-staff-dashboard ./staff-dashboard

# Run with Docker Compose
docker-compose up -d
docker-compose down
```

### Manual Deployment

```bash
# Production build for deployment
npx nx run-many -t build --prod

# Copy built files to server
rsync -avz owner-dashboard/dist/ user@server:/var/www/owner-dashboard/
rsync -avz staff-dashboard/dist/ user@server:/var/www/staff-dashboard/
rsync -avz api/dist/ user@server:/app/restaurant-api/

# Start API on server
cd /app/restaurant-api
NODE_ENV=production node main.js
```

### Environment Setup

```bash
# Create environment files
cp .env.example .env
cp api/.env.example api/.env

# Set up MongoDB connection
export MONGODB_URI="mongodb://localhost:27017/restaurant"
# or for MongoDB Atlas
export MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/restaurant"

# Set up other environment variables
export PORT=3000
export JWT_SECRET="your-secret-key"
export NODE_ENV="development"
```

## 🎯 Quick Start (Full System)

### Option 1: Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# 3. Start MongoDB (if running locally)
mongod

# 4. Start all services (in separate terminals)
npx nx serve api          # Terminal 1
npx nx serve owner-dashboard  # Terminal 2
npx nx serve staff-dashboard  # Terminal 3

# 5. Access applications
# API: http://localhost:3000
# Owner Dashboard: http://localhost:4200
# Staff Dashboard: http://localhost:4201
```

### Option 2: Production Build

```bash
# 1. Build all projects
npx nx run-many -t build --prod

# 2. Start API server
cd api/dist && node main.js

# 3. Serve frontend applications
npx serve owner-dashboard/dist --port 8080
npx serve staff-dashboard/dist --port 8081
```

## 📁 Project Structure

```
restaurant-monorepo/
    api/                        # Backend API server
    owner-dashboard/            # Owner/Manager React app
    staff-dashboard/            # Kitchen/Waiter React app
    api-client/                 # API communication library
    shared-types/               # TypeScript type definitions
    shared-ui/                  # Reusable React components
    rbac/                       # Role-based access control
    database/                   # Database models and utilities
    api-e2e/                    # API end-to-end tests
    owner-dashboard-e2e/        # Owner dashboard E2E tests
    staff-dashboard-e2e/        # Staff dashboard E2E tests
```

## 📦 Package Management

### Adding Dependencies

```bash
# Add dependency to specific project
npm install package-name --workspace=api
npm install package-name --workspace=owner-dashboard

# Add to root workspace
npm install package-name

# Add dev dependency
npm install -D package-name --workspace=shared-ui
```

### Generating New Projects

```bash
# Generate new library
npx nx g @nx/js:lib new-library

# Generate new React library
npx nx g @nx/react:lib new-react-lib

# Generate new Node.js application
npx nx g @nx/node:app new-api

# Generate new React application
npx nx g @nx/react:app new-dashboard

# Generate new component
npx nx g @nx/react:component Button --project=shared-ui
```

## 🎯 Current Development Status

This project is in active development with the following status:

- ✅ **Architecture & Setup**: Complete Nx workspace configuration
- ✅ **Type System**: Comprehensive domain model with full TypeScript types
- ✅ **RBAC Design**: Role-based permission system defined
- 🚧 **API Implementation**: Basic Express server (expanding)
- 🚧 **Frontend Applications**: React shells (implementing features)
- 🚧 **Database Integration**: MongoDB models (in progress)
- 📋 **Testing Suite**: Framework ready (writing tests)

## 🤝 Contributing

This monorepo uses Nx for efficient development:

```bash
# Generate new library
npx nx g @nx/js:lib new-library

# Generate new React component
npx nx g @nx/react:component new-component --project=shared-ui

# View project dependencies
npx nx graph
```

## 📚 Documentation

- [Nx Documentation](https://nx.dev) - Monorepo management
- [TypeScript Guide](./shared-types/README.md) - Domain type definitions
- [API Documentation](./api/README.md) - Backend API reference
- [Component Library](./shared-ui/README.md) - Shared UI components

## 🔗 Useful Links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/js?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

---

Built with ❤️ using Nx monorepo architecture for scalable restaurant management.
