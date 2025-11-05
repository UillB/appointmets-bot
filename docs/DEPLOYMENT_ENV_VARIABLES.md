# Environment Variables for Deployment

This document describes all environment variables needed for deployment on Vercel, Docker, or other platforms.

## 🎯 Landing Page (Next.js)

### Environment Variables

Create `.env.local` file in `landing/` directory:

```env
# Backend API URL
# Development: http://localhost:4000
# Production: https://your-api-domain.com
API_BASE_URL=http://localhost:4000

# Admin Panel URL (where to redirect after login/register)
# Development: http://localhost:4200
# Production: 
#   - Same domain: https://your-domain.com/admin-panel
#   - Different domain: https://admin.your-domain.com
#   - Vercel: https://your-app.vercel.app (if admin panel is on same domain)
NEXT_PUBLIC_ADMIN_PANEL_URL=http://localhost:4200
```

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_ADMIN_PANEL_URL=https://your-admin-domain.com
```

**Note:** `NEXT_PUBLIC_*` variables are exposed to the browser, so use them only for public URLs.

### Docker Deployment

Add to `docker-compose.yml`:

```yaml
services:
  landing:
    environment:
      - API_BASE_URL=http://backend:4000
      - NEXT_PUBLIC_ADMIN_PANEL_URL=http://localhost:4200
```

---

## 🖥️ Admin Panel (React/Vite)

### Environment Variables

Currently, the admin panel uses dynamic URL detection based on `window.location`. No environment variables are required for basic functionality.

**API URL Detection:**
- HTTPS or non-localhost: Uses relative path `/api`
- Localhost: Uses `http://localhost:4000/api`

### For Custom API URL

If you need to override API URL, you can add to `admin-panel-react/.env`:

```env
VITE_API_URL=https://your-api-domain.com/api
```

Then update `admin-panel-react/src/services/api.ts` to use this variable.

---

## 🔧 Backend (Node.js/Express)

### Environment Variables

Create `.env` file in `backend/` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@db:5432/appointments
# OR for SQLite (development):
# DATABASE_URL=file:./prisma/dev.db

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Public URLs
PUBLIC_BASE_URL=https://your-domain.com
WEBAPP_URL=https://your-domain.com

# Node Environment
NODE_ENV=production
PORT=4000

# AI (optional)
OPENAI_API_KEY=your_openai_api_key
```

---

## 🌐 Deployment Scenarios

### Scenario 1: Same Domain (Recommended for Production)

**Setup:**
- Landing: `https://your-domain.com`
- Admin Panel: `https://your-domain.com/admin-panel`
- Backend API: `https://your-domain.com/api`

**Environment Variables:**

**Landing:**
```env
API_BASE_URL=https://your-domain.com
NEXT_PUBLIC_ADMIN_PANEL_URL=https://your-domain.com/admin-panel
```

**Backend:**
```env
PUBLIC_BASE_URL=https://your-domain.com
WEBAPP_URL=https://your-domain.com
```

**Benefits:**
- ✅ Same-origin policy allows sharing localStorage/cookies
- ✅ No CORS issues
- ✅ Better security
- ✅ Simpler configuration

---

### Scenario 2: Different Domains (Vercel Separate Projects)

**Setup:**
- Landing: `https://landing.vercel.app`
- Admin Panel: `https://admin.vercel.app`
- Backend API: `https://api.your-domain.com`

**Environment Variables:**

**Landing:**
```env
API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_ADMIN_PANEL_URL=https://admin.vercel.app
```

**Admin Panel:**
```env
VITE_API_URL=https://api.your-domain.com/api
```

**Backend:**
```env
PUBLIC_BASE_URL=https://api.your-domain.com
WEBAPP_URL=https://admin.vercel.app
```

**Note:**
- Token is passed via URL parameters (removed immediately after saving)
- CORS must be configured on backend for both domains

---

### Scenario 3: Docker Compose (All Services Together)

**Environment Variables:**

**docker-compose.yml:**
```yaml
services:
  backend:
    environment:
      - DATABASE_URL=postgresql://appointments:password@db:5432/appointments
      - JWT_SECRET=your-secret
      - PUBLIC_BASE_URL=http://localhost
      - WEBAPP_URL=http://localhost/admin-panel
      
  landing:
    environment:
      - API_BASE_URL=http://backend:4000
      - NEXT_PUBLIC_ADMIN_PANEL_URL=http://localhost/admin-panel
      
  admin-panel:
    environment:
      - VITE_API_URL=http://backend:4000/api
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use strong JWT secrets** - Generate random 32+ character strings
3. **Use HTTPS in production** - Always use `https://` URLs
4. **Rotate secrets regularly** - Change JWT secrets periodically
5. **Use environment-specific configs** - Separate dev/staging/prod configs

---

## 📝 Quick Reference

### Development (Local)

```bash
# Landing
cd landing
echo "API_BASE_URL=http://localhost:4000" > .env.local
echo "NEXT_PUBLIC_ADMIN_PANEL_URL=http://localhost:4200" >> .env.local

# Backend
cd backend
echo "DATABASE_URL=file:./prisma/dev.db" > .env
echo "JWT_SECRET=dev-secret-key" >> .env
echo "PUBLIC_BASE_URL=http://localhost:4000" >> .env
```

### Production (Vercel)

**Landing:**
- `API_BASE_URL`: Your backend API URL
- `NEXT_PUBLIC_ADMIN_PANEL_URL`: Your admin panel URL

**Backend:**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random secret
- `PUBLIC_BASE_URL`: Your backend URL
- `WEBAPP_URL`: Your admin panel URL

---

## ✅ Verification

After deployment, verify environment variables are working:

1. **Check Landing Login:**
   - Login should redirect to admin panel
   - Token should be in URL (briefly)
   - Should authenticate successfully

2. **Check API Connection:**
   - Admin panel should load data from API
   - No CORS errors in console

3. **Check Token Storage:**
   - Token should be in localStorage after login
   - Token should be removed from URL immediately

---

## 🆘 Troubleshooting

### Issue: Landing doesn't redirect to admin panel

**Solution:** Check `NEXT_PUBLIC_ADMIN_PANEL_URL` is set correctly.

### Issue: CORS errors

**Solution:** Configure CORS on backend to allow your domains.

### Issue: Token not saved after redirect

**Solution:** Check that admin panel reads URL parameters correctly (see `admin-panel-react/src/hooks/useAuth.tsx`).

### Issue: Environment variables not working in Next.js

**Solution:** 
- Restart dev server after adding `.env.local`
- Use `NEXT_PUBLIC_*` prefix for client-side variables
- Check that variables are in `.env.local` (not `.env`)

---

*Last Updated: January 2025*

