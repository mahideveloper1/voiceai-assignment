# Multi-Tenant Project Management System

A modern, full-stack project management application built with Django GraphQL backend and React TypeScript frontend, with comprehensive CI/CD pipeline and automated testing.

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Multi-Tenancy](#multi-tenancy)
- [Development](#development)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Sample Data](#sample-data)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [Documentation](#documentation)

## Features

### Core Features
- **Multi-tenant Architecture**: Organization-based data isolation using slug-based authentication
- **Real-time Updates**: WebSocket subscriptions for live task and comment updates
- **Project Management**: Create, update, and track projects with status indicators
- **Task Board**: Kanban-style board with drag-and-drop task organization
- **Task Comments**: Collaborative commenting system on tasks
- **Advanced Filtering**: Search and filter projects and tasks
- **Responsive Design**: Mobile-friendly interface built with TailwindCSS
- **Type-Safe**: Full TypeScript implementation on frontend

### DevOps & Quality
- **Automated CI/CD**: GitHub Actions pipeline for testing and deployment
- **Comprehensive Testing**: 36+ backend tests (pytest) and frontend component tests (Vitest)
- **Code Quality**: Automated linting (Black, Flake8, ESLint, Prettier)
- **Code Coverage**: 50%+ coverage enforced on all PRs
- **Production Ready**: Docker containers, health checks, and deployment configs
- **Multi-Environment**: Separate configs for development, testing, and production

## Tech Stack

### Backend
- **Django 4.2** - Web framework
- **Graphene-Django** - GraphQL implementation
- **PostgreSQL** - Primary database
- **Django Channels** - WebSocket support for real-time features
- **Redis** - Channel layer backend
- **Daphne** - ASGI server

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Apollo Client** - GraphQL client with WebSocket support
- **TailwindCSS** - Styling framework
- **React Router** - Navigation
- **React Hook Form** - Form management
- **Vite** - Build tool and dev server

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Docker & Docker Compose** (for PostgreSQL and Redis)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd voiceai
```

### 2. Start Docker Services

```bash
docker-compose up -d
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Load sample data
python manage.py loaddata core/fixtures/sample_data.json

# Run the server
python manage.py runserver
```

Backend will be available at:
- **GraphQL API**: http://localhost:8000/graphql/
- **Django Admin**: http://localhost:8000/admin/

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

## Project Structure

```
voiceai/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD pipeline
├── backend/                      # Django backend
│   ├── project_management/       # Django project settings
│   │   ├── settings.py          # Main configuration
│   │   ├── urls.py              # URL routing (includes /health/)
│   │   ├── asgi.py              # ASGI configuration
│   │   └── routing.py           # WebSocket routing
│   ├── core/                     # Main application
│   │   ├── models/              # Django models
│   │   │   ├── organization.py
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   └── task_comment.py
│   │   ├── schema/              # GraphQL schema
│   │   │   ├── types.py
│   │   │   ├── queries.py      # ✅ Organization filtering added
│   │   │   ├── mutations.py    # ✅ Organization validation added
│   │   │   └── subscriptions.py
│   │   ├── middleware/          # Multi-tenancy middleware
│   │   ├── consumers/           # WebSocket consumers
│   │   ├── fixtures/            # Sample data
│   │   └── admin.py            # Django admin config
│   ├── tests/                   # ✅ Test suite (36+ tests)
│   │   ├── test_models/         # Model tests
│   │   └── test_graphql/        # GraphQL API tests
│   ├── pytest.ini               # ✅ pytest configuration
│   ├── conftest.py              # ✅ Test fixtures
│   ├── .flake8                  # ✅ Linting rules
│   ├── pyproject.toml           # ✅ Black/isort config
│   ├── Dockerfile               # ✅ Production Docker image
│   ├── railway.json             # ✅ Railway deployment config
│   ├── requirements.txt         # Production dependencies
│   ├── requirements-dev.txt     # ✅ Development dependencies
│   └── manage.py
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── __tests__/           # ✅ Test suite
│   │   │   ├── setup.ts         # Test configuration
│   │   │   └── components/      # Component tests
│   │   ├── components/          # React components
│   │   │   ├── common/         # Reusable components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── projects/       # Project components
│   │   │   └── tasks/          # Task components
│   │   ├── pages/              # Page components
│   │   ├── graphql/            # GraphQL operations
│   │   │   ├── queries/
│   │   │   ├── mutations/
│   │   │   └── subscriptions/
│   │   ├── types/              # TypeScript types
│   │   ├── contexts/           # React contexts
│   │   ├── utils/              # Utilities
│   │   │   └── apollo.ts       # Apollo Client setup
│   │   └── App.tsx             # Main app component
│   ├── vitest.config.ts         # ✅ Vitest configuration
│   ├── .prettierrc              # ✅ Prettier configuration
│   ├── vercel.json              # ✅ Vercel deployment config
│   ├── package.json             # ✅ Updated with test scripts
│   └── vite.config.ts
├── docker-compose.yml           # Docker services
├── CI_CD_SETUP_INSTRUCTIONS.md  # ✅ Complete CI/CD guide
├── ENVIRONMENT_VARIABLES.md     # ✅ Environment variables guide
```

## Multi-Tenancy

The system uses organization slug-based tenancy:

1. **Set Organization Header**: All API requests must include the `X-Organization-Slug` header
2. **Automatic Filtering**: Data is automatically filtered by organization
3. **Data Isolation**: Each organization's data is completely isolated

### Example Request with Organization Header:

```bash
curl -X POST http://localhost:8000/graphql/ \
  -H "Content-Type: application/json" \
  -H "X-Organization-Slug: acme-corporation" \
  -d '{"query":"{ projects { id name } }"}'
```

## Development

### Backend Development

```bash
# Run migrations after model changes
python manage.py makemigrations
python manage.py migrate

# Create new app
python manage.py startapp app_name

# Run tests
pytest -v

# Run tests with coverage
pytest --cov=core --cov-report=html

# Code quality checks
black --check .
flake8
isort --check .

# Format code
black .
isort .

# Shell access
python manage.py shell
```

### Frontend Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Check code formatting
npm run format:check

# Format code
npm run format

# Generate GraphQL types (after backend changes)
npm run codegen
```

## Testing

### Running Tests

**Backend Tests** (pytest):
```bash
cd backend
pip install -r requirements-dev.txt
pytest -v --cov=core
```

**Frontend Tests** (Vitest):
```bash
cd frontend
npm install
npm run test
```

### Test Coverage

- **Backend**: 36+ tests covering models, GraphQL queries/mutations, and organization isolation
- **Frontend**: Component tests with React Testing Library
- **Coverage Threshold**: 50% minimum enforced by CI pipeline
- **View Coverage Reports**:
  - Backend: Open `backend/htmlcov/index.html`
  - Frontend: Open `frontend/coverage/index.html`

### Writing Tests

**Backend Example** (pytest):
```python
# backend/tests/test_models/test_organization.py
import pytest
from core.models import Organization

@pytest.mark.django_db
def test_organization_creation():
    org = Organization.objects.create(name="Test Org")
    assert org.slug == "test-org"
```

**Frontend Example** (Vitest):
```typescript
// frontend/src/__tests__/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## CI/CD Pipeline

### Automated Testing & Deployment

Every push to `master` and pull request automatically triggers:

1. **Code Quality Checks**
   - Backend: Black, Flake8, isort
   - Frontend: ESLint, Prettier, TypeScript compiler

2. **Automated Tests**
   - Backend: pytest with PostgreSQL and Redis services
   - Frontend: Vitest with jsdom environment
   - Coverage: Must meet 50% threshold

3. **Build Verification**
   - Backend: Docker image build
   - Frontend: Production build (`npm run build`)

4. **Deployment** (on merge to master)
   - Backend → Railway (automatic)
   - Frontend → Vercel (automatic)

### CI Pipeline Status

View pipeline runs: [GitHub Actions](https://github.com/mahideveloper1/voiceai-assignment/actions)

### Local CI Simulation

Run the same checks that CI runs:

**Backend**:
```bash
cd backend
black --check .
isort --check .
flake8
pytest --cov=core --cov-fail-under=50
```

**Frontend**:
```bash
cd frontend
npm run format:check
npm run lint
npx tsc --noEmit
npm run test:coverage
npm run build
```

## Deployment

### Production Deployment

#### Backend (Railway)

1. **Create Railway Account**: https://railway.app/
2. **Create New Project** from GitHub repository
3. **Add Services**:
   - PostgreSQL database
   - Redis database
4. **Set Environment Variables**:
   ```env
   DEBUG=False
   SECRET_KEY=<generate-strong-key>
   ALLOWED_HOSTS=*.railway.app
   CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
5. **Deploy**: Railway auto-deploys from `master` branch

**Health Check**: `https://your-backend.railway.app/health/`

#### Frontend (Vercel)

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Login**: `vercel login`
3. **Link Project**:
   ```bash
   cd frontend
   vercel link
   ```
4. **Set Environment Variables**:
   ```env
   VITE_GRAPHQL_HTTP_URL=https://your-backend.railway.app/graphql/
   VITE_GRAPHQL_WS_URL=wss://your-backend.railway.app/graphql/
   ```
5. **Deploy**: `vercel --prod`

### Deployment Documentation

- **Complete Setup Guide**: See [CI_CD_SETUP_INSTRUCTIONS.md](./CI_CD_SETUP_INSTRUCTIONS.md)
- **Environment Variables**: See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)

## Environment Variables

### Quick Setup

**Backend**:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your settings (defaults work for local development)
```

**Frontend**:
```bash
cp frontend/.env.example frontend/.env.local
# Default values work for local development
```

### Required Variables

**Backend** (`backend/.env`):
```env
DEBUG=True                                    # Set to False in production
SECRET_KEY=your-secret-key                   # Generate strong key for production
DATABASE_NAME=project_management
DATABASE_USER=pm_user
DATABASE_PASSWORD=pm_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1          # Add production domains
CORS_ALLOWED_ORIGINS=http://localhost:5173  # Add production frontend URL
```

**Frontend** (`frontend/.env.local`):
```env
VITE_GRAPHQL_HTTP_URL=http://localhost:8000/graphql/
VITE_GRAPHQL_WS_URL=ws://localhost:8000/graphql/
VITE_ORGANIZATION_SLUG=acme-corporation    # Optional: default organization
```

### Detailed Documentation

For complete environment variable documentation including production setup:
- See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Full guide with all variables explained

## Sample Data

The system includes sample data with:
- 2 Organizations (Acme Corporation, TechStart Inc)
- 2 Projects
- Multiple tasks with various statuses
- Sample comments

To load sample data:

```bash
cd backend
python manage.py loaddata core/fixtures/sample_data.json
```

## Troubleshooting

### Docker not starting

- Ensure Docker Desktop is running
- Check port conflicts (5432, 5050, 6379)
- Run: `docker-compose down && docker-compose up -d`

### Backend connection errors

- Verify PostgreSQL is running: `docker ps`
- Check database credentials in `.env`
- Ensure virtual environment is activated

### Frontend API errors

- Verify backend is running on port 8000
- Check `.env.local` has correct API URLs
- Verify organization slug is set correctly

### GraphQL codegen errors

- Ensure backend is running before running `npm run codegen`
- Check `codegen.yml` schema URL is correct

## Future Improvements

### Implemented 
- ✅ **CI/CD Pipeline**: Automated testing and deployment with GitHub Actions
- ✅ **Comprehensive Testing**: 36+ backend tests with pytest, frontend tests with Vitest
- ✅ **Code Quality Tools**: Black, Flake8, ESLint, Prettier
- ✅ **Production Deployment**: Docker containers, Railway & Vercel configs
- ✅ **Organization Data Isolation**: Multi-tenant architecture with complete data separation

### Planned 
- User authentication and authorization
- Email notifications for task assignments
- File attachments on tasks and comments
- Activity timeline and audit logs
- Advanced analytics and reporting
- Export functionality (PDF, CSV)
- End-to-end testing with Playwright/Cypress
- Performance monitoring and error tracking (Sentry)
- Database backups and disaster recovery


## Documentation

### 📖 Comprehensive Guides

This project includes detailed documentation to help you get started:

| Document | Description | Link |
|----------|-------------|------|
| **CI/CD Setup Guide** | Complete guide for setting up automated testing and deployment | [CI_CD_SETUP_INSTRUCTIONS.md](./CI_CD_SETUP_INSTRUCTIONS.md) |
| **Environment Variables** | Detailed explanation of all environment variables for dev and production | [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) |
| **Codebase Documentation** | Comprehensive technical documentation of the entire codebase | [claude.md](./claude.md) |

### 🔍 What Each Guide Covers

**CI/CD Setup Guide** (`CI_CD_SETUP_INSTRUCTIONS.md`):
- Running tests locally (backend & frontend)
- Deploying to Railway (backend)
- Deploying to Vercel (frontend)
- Understanding the CI/CD pipeline
- Writing additional tests
- Troubleshooting CI/CD issues

**Environment Variables Guide** (`ENVIRONMENT_VARIABLES.md`):
- Complete table of all required variables
- Local development setup
- Testing environment setup
- Production deployment setup
- Railway & Vercel configuration
- Common issues and solutions


---

**Built using Django, GraphQL, React, and TypeScript**

**CI/CD powered by GitHub Actions, Railway, and Vercel**
