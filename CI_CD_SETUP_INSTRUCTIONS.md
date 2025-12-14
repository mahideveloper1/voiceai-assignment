# CI/CD Setup Instructions for VoiceAI Project

## 🎉 What's Been Created

A comprehensive CI/CD pipeline has been set up for your voiceai project with:

### ✅ Backend Testing Infrastructure (Phase 1)
- `backend/requirements-dev.txt` - Testing & linting dependencies
- `backend/pytest.ini` - pytest configuration (50% coverage threshold)
- `backend/.flake8` - Linting rules (Black-compatible)
- `backend/pyproject.toml` - Black & isort configuration
- `backend/.coveragerc` - Coverage reporting
- `backend/conftest.py` - pytest fixtures
- `backend/.env.test` - Test environment variables
- `backend/.dockerignore` - Docker build exclusions
- **36 sample backend tests** across 4 test files demonstrating:
  - Model testing patterns
  - GraphQL query testing
  - GraphQL mutation testing
  - Organization isolation testing

### ✅ Frontend Testing Infrastructure (Phase 2)
- `frontend/package.json` - Updated with test scripts & dependencies
- `frontend/vitest.config.ts` - Vitest configuration (50% coverage)
- `frontend/.prettierrc` - Code formatting rules
- `frontend/.prettierignore` - Format exclusions
- `frontend/.env.test` - Test environment
- `frontend/src/__tests__/setup.ts` - Test setup with mocks
- **1 sample frontend test** for Header component

### ✅ CI Pipeline (Phase 3)
- `.github/workflows/ci.yml` - GitHub Actions workflow
  - Backend tests with PostgreSQL & Redis
  - Frontend tests with full build verification
  - Code quality checks (Black, Flake8, ESLint, Prettier)
  - Coverage reporting
  - Runs on PR and push to master

### ✅ Deployment Configuration (Phases 4 & 5)
- `backend/Dockerfile` - Production-ready multi-stage build
- `backend/railway.json` - Railway deployment config
- `backend/project_management/urls.py` - Added `/health/` endpoint
- `frontend/vercel.json` - Vercel deployment config

---

## 🚀 Quick Start - Running Tests Locally

### Backend Tests

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dev dependencies
pip install -r requirements-dev.txt

# 3. Run all tests
pytest -v

# 4. Run tests with coverage
pytest --cov=core --cov-report=html

# 5. Check code quality
black --check .
isort --check .
flake8

# 6. Format code (if needed)
black .
isort .
```

### Frontend Tests

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Run tests
npm run test

# 4. Run tests with UI
npm run test:ui

# 5. Run tests with coverage
npm run test:coverage

# 6. Check formatting
npm run format:check

# 7. Format code (if needed)
npm run format

# 8. Lint code
npm run lint
```

---

## 📋 Next Steps

### Step 1: Install Dependencies & Run Tests Locally

**Backend**:
```bash
cd backend
pip install -r requirements-dev.txt
pytest -v
```

**Frontend**:
```bash
cd frontend
npm install
npm run test
```

**Expected**: Tests should run successfully (or with minor fixes needed for environment-specific issues)

---

### Step 2: Push to GitHub to Trigger CI

```bash
# Add all new files
git add .

# Commit changes
git commit -m "Add CI/CD setup with testing infrastructure

- Added pytest configuration and sample backend tests
- Added Vitest configuration and sample frontend tests
- Added GitHub Actions CI workflow
- Added Dockerfile and deployment configs
- Added health check endpoint

🤖 Generated with Claude Code"

# Push to repository
git push origin master
```

**Expected**: GitHub Actions will automatically run the CI pipeline

- Go to: https://github.com/mahideveloper1/voiceai-assignment/actions
- You should see the "CI" workflow running
- It will run backend tests, frontend tests, linting, and build verification

---

### Step 3: Deploy Backend to Railway

#### 3.1 Create Railway Account
1. Go to https://railway.app/
2. Sign up with GitHub (free tier available)

#### 3.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `voiceai-assignment` repository
4. Railway will detect the Dockerfile

#### 3.3 Add Services
1. **PostgreSQL**: Click "+ New" → Database → PostgreSQL
2. **Redis**: Click "+ New" → Database → Redis

#### 3.4 Configure Environment Variables
In Railway project settings, add:

```env
DEBUG=False
SECRET_KEY=<generate-a-strong-secret-key>
ALLOWED_HOSTS=*.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

**Note**: DATABASE_URL and REDIS_URL are automatically provided by Railway

#### 3.5 Deploy
1. Railway will automatically build using your Dockerfile
2. Wait for deployment to complete
3. Get your backend URL: `https://voiceai-backend-production.up.railway.app`

#### 3.6 Verify Deployment
Visit: `https://your-backend-url.railway.app/health/`

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "service": "voiceai-backend"
}
```

---

### Step 4: Deploy Frontend to Vercel

#### 4.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 4.2 Login to Vercel
```bash
vercel login
```

#### 4.3 Link Project
```bash
cd frontend
vercel link
```

#### 4.4 Set Environment Variables
In Vercel dashboard (https://vercel.com):
1. Go to your project → Settings → Environment Variables
2. Add:
   - `VITE_GRAPHQL_HTTP_URL` = `https://your-backend.railway.app/graphql/`
   - `VITE_GRAPHQL_WS_URL` = `wss://your-backend.railway.app/graphql/`

#### 4.5 Deploy
```bash
vercel --prod
```

#### 4.6 Update Backend CORS
Go back to Railway and update CORS_ALLOWED_ORIGINS:
```env
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

---

### Step 5: Enable Automatic Deployments (Optional)

#### Option A: Connect Railway to GitHub
1. In Railway project settings
2. Enable "Deploy on Push"
3. Select branch: `master`

Now every push to master will automatically deploy to Railway!

#### Option B: Connect Vercel to GitHub
1. In Vercel project settings
2. Connect to GitHub repository
3. Enable automatic deployments

Now every push to master will automatically deploy to Vercel!

---

## 📊 CI/CD Pipeline Overview

### What Happens on Every PR/Push:

```
┌─────────────────────────────────────┐
│  1. Code Quality & Linting          │
├─────────────────────────────────────┤
│  Backend: Black, isort, Flake8      │
│  Frontend: ESLint, Prettier, TSC    │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  2. Run Tests                       │
├─────────────────────────────────────┤
│  Backend: 36 pytest tests           │
│  Frontend: Component tests          │
│  Coverage: 50% minimum              │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  3. Build Verification              │
├─────────────────────────────────────┤
│  Backend: Docker image build        │
│  Frontend: npm run build            │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  4. Deploy (on master merge)        │
├─────────────────────────────────────┤
│  Backend → Railway                  │
│  Frontend → Vercel                  │
└─────────────────────────────────────┘
```

---

## 🧪 Writing More Tests

### Backend Test Examples

**Model Test**:
```python
# backend/tests/test_models/test_task.py
import pytest
from core.models import Task

@pytest.mark.unit
@pytest.mark.django_db
def test_task_creation(project):
    task = Task.objects.create(
        project=project,
        title="Test Task",
        status="todo",
        priority="high"
    )
    assert task.title == "Test Task"
    assert task.status == "todo"
```

**GraphQL Test**:
```python
# backend/tests/test_graphql/test_tasks.py
@pytest.mark.graphql
@pytest.mark.django_db
def test_get_tasks(graphql_query_with_org, task):
    query = """
        query {
            tasks {
                id
                title
                status
            }
        }
    """
    result = graphql_query_with_org(query)
    assert "errors" not in result
    assert len(result["data"]["tasks"]) == 1
```

### Frontend Test Examples

**Component Test**:
```typescript
// frontend/src/__tests__/components/ProjectCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectCard } from '../../components/projects/ProjectCard';

describe('ProjectCard', () => {
  it('displays project information', () => {
    const project = {
      id: '123',
      name: 'Test Project',
      status: 'active',
    };

    render(<ProjectCard project={project} onClick={() => {}} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });
});
```

---

## 📁 File Structure Summary

```
voiceai/
├── .github/
│   └── workflows/
│       └── ci.yml                    ✅ CI pipeline
├── backend/
│   ├── tests/                        ✅ 36 sample tests
│   ├── pytest.ini                    ✅ pytest config
│   ├── .flake8                       ✅ linting rules
│   ├── pyproject.toml                ✅ Black/isort config
│   ├── conftest.py                   ✅ test fixtures
│   ├── Dockerfile                    ✅ production build
│   ├── railway.json                  ✅ Railway config
│   └── requirements-dev.txt          ✅ test dependencies
├── frontend/
│   ├── src/__tests__/                ✅ test setup + samples
│   ├── vitest.config.ts              ✅ Vitest config
│   ├── .prettierrc                   ✅ formatting rules
│   ├── vercel.json                   ✅ Vercel config
│   └── package.json                  ✅ updated with test scripts
└── CI_CD_SETUP_INSTRUCTIONS.md       📄 this file
```

---

## 🔧 Troubleshooting

### Backend Tests Failing?

**Issue**: Database connection errors
```bash
# Solution: Ensure PostgreSQL is running
docker-compose up postgres -d

# Or use test database
export DATABASE_NAME=test_project_management
```

**Issue**: Import errors
```bash
# Solution: Ensure you're in backend directory and venv is activated
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt -r requirements-dev.txt
```

### Frontend Tests Failing?

**Issue**: Module not found errors
```bash
# Solution: Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Mock errors
```bash
# Solution: Check that setup.ts is being loaded
# Verify vitest.config.ts has: setupFiles: './src/__tests__/setup.ts'
```

### CI Pipeline Failing?

**Issue**: Tests pass locally but fail in CI
- Check that .env.test files exist
- Verify all dependencies are in requirements.txt/package.json
- Check PostgreSQL/Redis service configuration in ci.yml

**Issue**: Build step fails
- Ensure Dockerfile syntax is correct
- Check that all required files are committed to git
- Verify .dockerignore doesn't exclude necessary files

---

## 📈 Coverage Reports

### Backend Coverage
After running `pytest --cov=core`, open:
```
backend/htmlcov/index.html
```

### Frontend Coverage
After running `npm run test:coverage`, open:
```
frontend/coverage/index.html
```

---

## 🎯 Success Criteria

- ✅ Backend tests pass with 50%+ coverage
- ✅ Frontend tests pass with 50%+ coverage
- ✅ All linting checks pass (Black, Flake8, ESLint, Prettier)
- ✅ TypeScript compilation succeeds
- ✅ Frontend build completes successfully
- ✅ CI pipeline runs on every PR
- ✅ Backend deploys to Railway
- ✅ Frontend deploys to Vercel
- ✅ Health check endpoint responds successfully

---

## 📝 Adding More Tests (Recommended)

To increase coverage and robustness:

1. **Backend**: Write tests for:
   - Task model and mutations
   - TaskComment model and mutations
   - Middleware (organization context)
   - Edge cases and error handling

2. **Frontend**: Write tests for:
   - ProjectCard component
   - Dashboard page
   - ProjectsPage and ProjectDetailPage
   - OrganizationContext
   - Custom hooks
   - Utility functions

3. **E2E Tests** (Future enhancement):
   - Install Playwright or Cypress
   - Test complete user flows
   - Test organization switching

---

## 🚨 Important Notes

1. **Coverage Thresholds**: Currently set to 50%. Increase to 80% when you have time to write comprehensive tests.

2. **Environment Variables**: Never commit `.env` files with secrets. Use `.env.example` instead.

3. **Database Migrations**: Railway automatically runs migrations on deploy. Ensure migrations are committed.

4. **Static Files**: Django's `collectstatic` is run during Docker build. Ensure STATIC_ROOT is configured.

5. **CORS**: Update CORS_ALLOWED_ORIGINS in Railway when you deploy frontend to Vercel.

---

## 📚 Additional Resources

- **pytest Documentation**: https://docs.pytest.org/
- **Vitest Documentation**: https://vitest.dev/
- **Railway Documentation**: https://docs.railway.app/
- **Vercel Documentation**: https://vercel.com/docs
- **GitHub Actions**: https://docs.github.com/en/actions

---

## 🎊 You're All Set!

Your CI/CD pipeline is now configured and ready to use. Every time you push code:

1. GitHub Actions will run tests automatically
2. You'll get instant feedback on code quality
3. Deployments can be automated to Railway and Vercel

**Next recommended steps**:
1. Install dependencies and run tests locally to verify setup
2. Push to GitHub and verify CI pipeline runs
3. Deploy to Railway and Vercel
4. Start writing more tests to increase coverage!

Happy coding! 🚀
