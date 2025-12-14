# Multi-Tenant Project Management System

A modern, full-stack project management application built with Django GraphQL backend and React TypeScript frontend, featuring real-time WebSocket updates and organization-based multi-tenancy.

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Multi-Tenancy](#multi-tenancy)
- [Real-Time Updates](#real-time-updates)
- [Development](#development)
- [Environment Variables](#environment-variables)
- [Sample Data](#sample-data)
- [Troubleshooting](#troubleshooting)

## Features

- **Multi-tenant Architecture**: Organization-based data isolation using slug-based authentication
- **Real-time Updates**: WebSocket connections for live task and comment updates
- **Project Management**: Create, update, delete, and track projects with status indicators
- **Task Board**: Kanban-style board with task organization across different statuses
- **Task Comments**: Collaborative commenting system with author email tracking
- **Organization Management**: Create and switch between multiple organizations
- **Advanced Filtering**: Search and filter projects and tasks
- **Responsive Design**: Mobile-friendly interface built with TailwindCSS
- **Type-Safe**: Full TypeScript implementation on frontend
- **GraphQL API**: Efficient data fetching with GraphQL queries and mutations

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
- **Docker** (for PostgreSQL and Redis)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd voiceai
```

### 2. Start Docker Services

**Start PostgreSQL:**
```bash
docker run -d \
  --name pm_postgres \
  -e POSTGRES_DB=project_management \
  -e POSTGRES_USER=pm_user \
  -e POSTGRES_PASSWORD=pm_password \
  -p 5432:5432 \
  postgres:15-alpine
```

**Start Redis:**
```bash
docker run -d \
  --name pm_redis \
  -p 6379:6379 \
  redis:7-alpine
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
│   ├── requirements.txt         # Python dependencies
│   └── manage.py
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── common/         # Reusable components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── organization/   # Organization components
│   │   │   ├── projects/       # Project components
│   │   │   └── tasks/          # Task components
│   │   ├── pages/              # Page components
│   │   ├── graphql/            # GraphQL operations
│   │   │   ├── queries/
│   │   │   ├── mutations/
│   │   │   └── subscriptions/  # Real-time subscriptions
│   │   ├── hooks/              # Custom React hooks
│   │   │   └── useProjectWebSocket.ts  # WebSocket hook
│   │   ├── contexts/           # React contexts
│   │   │   └── OrganizationContext.tsx # Multi-tenancy context
│   │   ├── utils/              # Utilities
│   │   │   └── apollo.ts       # Apollo Client setup
│   │   └── App.tsx             # Main app component
│   ├── package.json
│   └── vite.config.ts
├── CLAUDE.md                    # Complete project documentation
└── ENVIRONMENT_VARIABLES.md     # Environment setup guide
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

## Real-Time Updates

The application uses **WebSocket** connections for real-time collaboration:

### How It Works

1. **Django Channels** - WebSocket server handling connections
2. **Redis** - Channel layer for broadcasting messages
3. **Custom Hook** - `useProjectWebSocket` manages WebSocket connection in React
4. **Automatic Updates** - Tasks and comments update in real-time across all connected clients

### What Updates in Real-Time

- ✅ **Task Creation** - New tasks appear instantly
- ✅ **Task Updates** - Status changes, edits reflect immediately
- ✅ **Task Deletion** - Deleted tasks disappear from all views
- ✅ **Comments** - New comments appear without refresh

### Testing Real-Time Features

1. Open **two browser windows** side-by-side
2. Navigate both to the same project
3. Create/update/delete tasks in one window
4. Watch changes appear instantly in the other window!

**WebSocket Console Logs:**
```
[WebSocket] Connecting to: ws://localhost:8000/ws/projects/<id>/
[WebSocket] Connected to project: <id>
[WebSocket] Task created: {id: "...", title: "..."}
```

## Development

### Backend Development

```bash
# Run migrations after model changes
python manage.py makemigrations
python manage.py migrate

# Create new app
python manage.py startapp app_name

# Load sample data
python manage.py loaddata core/fixtures/sample_data.json

# Create superuser
python manage.py createsuperuser

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
```

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
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_NAME=project_management
DATABASE_USER=pm_user
DATABASE_PASSWORD=pm_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend** (`frontend/.env.local`):
```env
VITE_GRAPHQL_HTTP_URL=http://localhost:8000/graphql/
VITE_GRAPHQL_WS_URL=ws://localhost:8000/graphql/
VITE_ORGANIZATION_SLUG=acme-corporation    # Optional: default organization
```

### Detailed Documentation

For complete environment variable documentation:
- See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Full guide with all variables

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
- Check port conflicts (5432, 6379)
- Restart containers: `docker restart pm_postgres pm_redis`

### Backend connection errors

- Verify PostgreSQL is running: `docker ps | grep pm_postgres`
- Verify Redis is running: `docker ps | grep pm_redis`
- Check database credentials in `.env`
- Ensure virtual environment is activated

### Frontend API errors

- Verify backend is running on port 8000
- Check `.env.local` has correct API URLs
- Verify organization slug is set correctly
- Check browser console for CORS errors

### WebSocket not connecting

- Ensure Redis is running: `docker exec -it pm_redis redis-cli ping` (should return PONG)
- Check browser console for WebSocket connection errors
- Verify `REDIS_URL` in backend `.env` is correct


---

**Built with Django, GraphQL, React, and TypeScript**
