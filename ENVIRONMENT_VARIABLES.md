# Environment Variables Guide

## 📋 Local Development Setup

### Backend Environment Variables

**File**: `backend/.env`

| Variable | Value | Description |
|----------|-------|-------------|
| `DEBUG` | `True` | Enable Django debug mode for development |
| `SECRET_KEY` | Any string | Django secret key (can be simple for local dev) |
| `DATABASE_NAME` | `project_management` | PostgreSQL database name |
| `DATABASE_USER` | `pm_user` | PostgreSQL username |
| `DATABASE_PASSWORD` | `pm_password` | PostgreSQL password |
| `DATABASE_HOST` | `localhost` | PostgreSQL host |
| `DATABASE_PORT` | `5432` | PostgreSQL port |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection URL for WebSockets |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Frontend URL for CORS |

### Frontend Environment Variables

**File**: `frontend/.env.local`

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_GRAPHQL_HTTP_URL` | `http://localhost:8000/graphql/` | GraphQL HTTP endpoint |
| `VITE_GRAPHQL_WS_URL` | `ws://localhost:8000/graphql/` | GraphQL WebSocket endpoint |
| `VITE_ORGANIZATION_SLUG` | `acme-corporation` | Optional: default organization slug |

---

## 🔧 Setup Instructions

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Copy example file (if exists) or create new .env
touch .env

# Add these variables to backend/.env
```

**Your `backend/.env` file:**
```env
DEBUG=True
SECRET_KEY=django-insecure-local-development-key-12345
DATABASE_NAME=project_management
DATABASE_USER=pm_user
DATABASE_PASSWORD=pm_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Step 2: Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Create .env.local file
touch .env.local

# Add variables
```

**Your `frontend/.env.local` file:**
```env
VITE_GRAPHQL_HTTP_URL=http://localhost:8000/graphql/
VITE_GRAPHQL_WS_URL=ws://localhost:8000/graphql/
VITE_ORGANIZATION_SLUG=acme-corporation
```

---

## 🐳 Docker Services

These environment variables assume you're running PostgreSQL and Redis via Docker:

**PostgreSQL:**
```bash
docker run -d \
  --name pm_postgres \
  -e POSTGRES_DB=project_management \
  -e POSTGRES_USER=pm_user \
  -e POSTGRES_PASSWORD=pm_password \
  -p 5432:5432 \
  postgres:15-alpine
```

**Redis:**
```bash
docker run -d \
  --name pm_redis \
  -p 6379:6379 \
  redis:7-alpine
```

---

## ✅ Verification

### Check Backend Configuration

```bash
cd backend
python manage.py check
```

If successful, environment variables are correctly configured.

### Check Database Connection

```bash
cd backend
python manage.py migrate
```

If migrations run successfully, database connection is working.

### Test Redis Connection

```bash
docker exec -it pm_redis redis-cli ping
```

Expected output: `PONG`

### Check Frontend Environment

Start the frontend dev server:
```bash
cd frontend
npm run dev
```

Open browser console and check:
- GraphQL requests should go to `http://localhost:8000/graphql/`
- WebSocket connections to `ws://localhost:8000/ws/projects/...`

---

## 🚨 Important Notes

### Security

1. **Never commit `.env` files to git**
   - `.env` files are in `.gitignore`
   - Only commit `.env.example` files without secrets

2. **Use simple keys for local development**
   - `SECRET_KEY` can be any string locally
   - No need for strong random keys in dev

3. **Keep default credentials simple**
   - `pm_password` is fine for local PostgreSQL
   - Docker containers are isolated to your machine

### CORS Configuration

- `CORS_ALLOWED_ORIGINS` must match your frontend URL exactly
- No trailing slash: `http://localhost:5173` ✅
- With trailing slash: `http://localhost:5173/` ❌

### WebSocket Requirements

- **Redis must be running** for WebSocket to work
- Check Redis: `docker ps | grep pm_redis`
- Test connection: `docker exec -it pm_redis redis-cli ping`

---

## 🆘 Common Issues

### Issue: "DisallowedHost" error

**Solution**: Verify `ALLOWED_HOSTS` in `backend/.env` includes `localhost,127.0.0.1`

### Issue: CORS errors in browser console

**Solution**:
- Add frontend URL to `CORS_ALLOWED_ORIGINS`
- No trailing slash
- Restart Django server after changing `.env`

### Issue: Can't connect to database

**Solution**:
1. Check PostgreSQL is running: `docker ps | grep pm_postgres`
2. Verify `DATABASE_HOST`, `DATABASE_PORT` match Docker container
3. Ensure credentials in `.env` match Docker container env vars

### Issue: WebSocket connection failed

**Solution**:
1. Check Redis is running: `docker ps | grep pm_redis`
2. Verify `REDIS_URL` is correct: `redis://localhost:6379/0`
3. Check browser console for specific error
4. Ensure firewall isn't blocking port 6379

### Issue: Frontend can't reach backend

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/health/`
2. Check `VITE_GRAPHQL_HTTP_URL` is correct
3. Ensure CORS is properly configured
4. Check Django logs for errors

---

## 📚 Additional Resources

- **Django Settings**: https://docs.djangoproject.com/en/4.2/topics/settings/
- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html
- **Django Channels**: https://channels.readthedocs.io/
- **Redis**: https://redis.io/docs/getting-started/

---

**Need help?** Check the main `README.md` file for more troubleshooting tips.
