# Multi-Tenant Project Management System

A modern, full-stack project management application built with Django GraphQL backend and React TypeScript frontend.

## Features

- **Multi-tenant Architecture**: Organization-based data isolation using slug-based authentication
- **Real-time Updates**: WebSocket subscriptions for live task and comment updates
- **Project Management**: Create, update, and track projects with status indicators
- **Task Board**: Kanban-style board with drag-and-drop task organization
- **Task Comments**: Collaborative commenting system on tasks
- **Advanced Filtering**: Search and filter projects and tasks
- **Responsive Design**: Mobile-friendly interface built with TailwindCSS
- **Type-Safe**: Full TypeScript implementation on frontend

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

This will start:
- PostgreSQL on port 5432
- pgAdmin on port 5050 (http://localhost:5050)
- Redis on port 6379

**pgAdmin credentials:**
- Email: admin@projectmanagement.com
- Password: admin

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
│   │   ├── urls.py              # URL routing
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
│   │   │   ├── queries.py
│   │   │   ├── mutations.py
│   │   │   └── subscriptions.py
│   │   ├── middleware/          # Multi-tenancy middleware
│   │   ├── consumers/           # WebSocket consumers
│   │   ├── fixtures/            # Sample data
│   │   └── admin.py            # Django admin config
│   ├── manage.py
│   └── requirements.txt
├── frontend/                     # React frontend
│   ├── src/
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
│   │   ├── utils/              # Utilities
│   │   │   └── apollo.ts       # Apollo Client setup
│   │   └── App.tsx             # Main app component
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml           # Docker services
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

## GraphQL API Examples

### Query Projects

```graphql
query {
  projects(status: "active", limit: 10) {
    id
    name
    description
    status
    taskStats {
      total
      completed
      completionRate
    }
  }
}
```

### Create Project

```graphql
mutation {
  createProject(
    organizationId: "11111111-1111-1111-1111-111111111111"
    name: "New Project"
    description: "Project description"
    status: "planning"
  ) {
    project {
      id
      name
      status
    }
  }
}
```

### Create Task

```graphql
mutation {
  createTask(
    projectId: "33333333-3333-3333-3333-333333333333"
    title: "Implement feature"
    description: "Add new functionality"
    status: "todo"
    priority: "high"
  ) {
    task {
      id
      title
      status
      priority
    }
  }
}
```

### Subscribe to Task Updates

```graphql
subscription {
  taskUpdated(projectId: "33333333-3333-3333-3333-333333333333") {
    id
    title
    status
    priority
  }
}
```

## Development

### Backend Development

```bash
# Run migrations after model changes
python manage.py makemigrations
python manage.py migrate

# Create new app
python manage.py startapp app_name

# Run tests (when implemented)
pytest

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

# Generate GraphQL types (after backend changes)
npm run codegen
```

## Environment Variables

### Backend (.env)

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_NAME=project_management
DATABASE_USER=pm_user
DATABASE_PASSWORD=pm_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env.local)

```env
VITE_GRAPHQL_HTTP_URL=http://localhost:8000/graphql/
VITE_GRAPHQL_WS_URL=ws://localhost:8000/graphql/
VITE_ORGANIZATION_SLUG=acme-corporation
```

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

- User authentication and authorization
- Email notifications for task assignments
- File attachments on tasks and comments
- Activity timeline and audit logs
- Advanced analytics and reporting
- Mobile app (React Native)
- Export functionality (PDF, CSV)
- Integration with third-party tools (Slack, Jira, etc.)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.
