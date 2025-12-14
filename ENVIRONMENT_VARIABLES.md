# Environment Variables Guide

## 📋 Quick Reference

### Backend (.env)

| Variable | Required | Local Value | Production Value | Description |
|----------|----------|-------------|------------------|-------------|
| `DEBUG` | ✅ Yes | `True` | `False` | Enable Django debug mode |
| `SECRET_KEY` | ✅ Yes | Any string | **Strong random key** | Django secret key |
| `DATABASE_NAME` | ✅ Yes | `project_management` | Auto (Railway) | PostgreSQL database name |
| `DATABASE_USER` | ✅ Yes | `pm_user` | Auto (Railway) | PostgreSQL username |
| `DATABASE_PASSWORD` | ✅ Yes | `pm_password` | Auto (Railway) | PostgreSQL password |
| `DATABASE_HOST` | ✅ Yes | `localhost` | Auto (Railway) | PostgreSQL host |
| `DATABASE_PORT` | ✅ Yes | `5432` | Auto (Railway) | PostgreSQL port |
| `REDIS_URL` | ✅ Yes | `redis://localhost:6379/0` | Auto (Railway) | Redis connection URL |
| `ALLOWED_HOSTS` | ✅ Yes | `localhost,127.0.0.1` | `*.railway.app` | Comma-separated hosts |
| `CORS_ALLOWED_ORIGINS` | ✅ Yes | `http://localhost:5173` | `https://your-app.vercel.app` | Frontend URL |

### Frontend (.env.local)

| Variable | Required | Local Value | Production Value | Description |
|----------|----------|-------------|------------------|-------------|
| `VITE_GRAPHQL_HTTP_URL` | ✅ Yes | `http://localhost:8000/graphql/` | `https://your-backend.railway.app/graphql/` | GraphQL HTTP endpoint |
| `VITE_GRAPHQL_WS_URL` | ✅ Yes | `ws://localhost:8000/graphql/` | `wss://your-backend.railway.app/graphql/` | GraphQL WebSocket endpoint |
| `VITE_ORGANIZATION_SLUG` | ❌ No | `acme-corporation` | `default-org` | Default organization |

---

## 🔧 Setup Instructions

### 1. Local Development Setup

**Backend**:
```bash
# Copy example file
cp backend/.env.example backend/.env

# Edit backend/.env with your local PostgreSQL credentials
# Default values should work if you're using docker-compose
```

**Your `backend/.env` should look like**:
```env
DEBUG=True
SECRET_KEY=django-insecure-change-this-in-production-12345678
DATABASE_NAME=project_management
DATABASE_USER=pm_user
DATABASE_PASSWORD=pm_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend**:
```bash
# Copy example file
cp frontend/.env.example frontend/.env.local

# Default values should work for local development
```

**Your `frontend/.env.local` should look like**:
```env
VITE_GRAPHQL_HTTP_URL=http://localhost:8000/graphql/
VITE_GRAPHQL_WS_URL=ws://localhost:8000/graphql/
VITE_ORGANIZATION_SLUG=acme-corporation
```

---

### 2. Testing Environment

**Backend** (uses `backend/.env.test` - already created):
```env
DEBUG=False
SECRET_KEY=test-secret-key-not-for-production
DATABASE_NAME=test_project_management
DATABASE_USER=pm_user
DATABASE_PASSWORD=pm_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
REDIS_URL=redis://localhost:6379/1
ALLOWED_HOSTS=testserver,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://testserver
```

**Frontend** (uses `frontend/.env.test` - already created):
```env
VITE_GRAPHQL_HTTP_URL=http://localhost:8000/graphql/
VITE_GRAPHQL_WS_URL=ws://localhost:8000/graphql/
```

---

### 3. Production Setup (Railway + Vercel)

#### Backend on Railway

**Set these in Railway Dashboard** → Project → Variables:

```env
DEBUG=False
SECRET_KEY=<generate-strong-random-key>
ALLOWED_HOSTS=*.railway.app,yourdomain.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**DON'T set these** (Railway provides automatically):
- ❌ `DATABASE_NAME` - Railway sets via `DATABASE_URL`
- ❌ `DATABASE_USER` - Railway sets via `DATABASE_URL`
- ❌ `DATABASE_PASSWORD` - Railway sets via `DATABASE_URL`
- ❌ `DATABASE_HOST` - Railway sets via `DATABASE_URL`
- ❌ `DATABASE_PORT` - Railway sets via `DATABASE_URL`
- ❌ `REDIS_URL` - Railway provides when you add Redis plugin

**Generate a strong SECRET_KEY**:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### Frontend on Vercel

**Set these in Vercel Dashboard** → Project → Settings → Environment Variables:

```env
VITE_GRAPHQL_HTTP_URL=https://your-backend-production.up.railway.app/graphql/
VITE_GRAPHQL_WS_URL=wss://your-backend-production.up.railway.app/graphql/
```

---

## 🚨 Important Notes

### ⚠️ Security Best Practices

1. **Never commit `.env` files to git**
   - ✅ `.env.example` is safe (no secrets)
   - ❌ `.env` contains secrets (in .gitignore)

2. **Different SECRET_KEY for each environment**
   - Local: Can use simple key
   - Production: **MUST** use strong random key

3. **Use strong passwords in production**
   - Don't use `pm_password` in production
   - Railway generates secure credentials automatically

### 📝 Railway Automatic Variables

When you add database services in Railway, it automatically provides:

**PostgreSQL Plugin provides**:
- `DATABASE_URL` (full connection string)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

**Redis Plugin provides**:
- `REDIS_URL` (full connection string)

**Your Django settings.py can use either**:
- Individual variables (current setup)
- Or `DATABASE_URL` (need to install `dj-database-url`)

### 🔄 Updating Production Environment

**After deploying frontend to Vercel**:
1. Get your Vercel URL: `https://your-app.vercel.app`
2. Update Railway backend environment:
   ```env
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
3. Railway will automatically redeploy

**After deploying backend to Railway**:
1. Get your Railway URL: `https://your-backend.up.railway.app`
2. Update Vercel frontend environment:
   ```env
   VITE_GRAPHQL_HTTP_URL=https://your-backend.up.railway.app/graphql/
   VITE_GRAPHQL_WS_URL=wss://your-backend.up.railway.app/graphql/
   ```
3. Redeploy frontend: `vercel --prod`

---

## ✅ Verification

### Check Backend Environment

```bash
cd backend
python manage.py check
```

If successful, all environment variables are correctly configured.

### Check Frontend Environment

```bash
cd frontend
npm run dev
```

Open browser console, you should see GraphQL requests going to the correct endpoint.

### Test Health Check

```bash
# Local
curl http://localhost:8000/health/

# Production
curl https://your-backend.railway.app/health/
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "service": "voiceai-backend"
}
```

---

## 📚 Additional Resources

- **Django Environment Variables**: https://docs.djangoproject.com/en/4.2/topics/settings/
- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html
- **Railway Environment Variables**: https://docs.railway.app/develop/variables
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables

---

## 🆘 Common Issues

### Issue: "DisallowedHost" error
**Solution**: Add your domain to `ALLOWED_HOSTS`

### Issue: CORS errors in browser console
**Solution**: Add frontend URL to `CORS_ALLOWED_ORIGINS` (no trailing slash)

### Issue: Can't connect to database
**Solution**: Check `DATABASE_HOST`, `DATABASE_PORT`, and ensure PostgreSQL is running

### Issue: WebSocket connection failed
**Solution**:
- Check `REDIS_URL` is correct
- Ensure Redis is running: `docker-compose up redis -d`
- Check firewall isn't blocking port 6379

### Issue: "Module not found" on Vercel
**Solution**: Ensure environment variables are set for **Production** environment in Vercel dashboard

---

**Need help?** Check the `CI_CD_SETUP_INSTRUCTIONS.md` file for more detailed troubleshooting.
