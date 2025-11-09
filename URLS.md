# 🌐 Все URL сервисов Appointments Bot

## ✅ Запущенные сервисы

### 🔧 Backend API
- **Локальный URL:** http://localhost:4000
- **Health Check:** http://localhost:4000/api/health
- **WebSocket:** ws://localhost:4000/ws
- **Статус:** ✅ Работает

### ⚛️ React Admin Panel (Админ панель)
- **Локальный URL:** http://localhost:4200
- **Статус:** ✅ Работает

### 🌐 Landing Page (Лендинг)
- **Локальный URL:** http://localhost:3000
- **Статус:** ✅ Работает

### 🚀 Ngrok HTTPS Tunnel (для Telegram WebApp)
- **HTTPS URL:** https://subchorioidal-gwyneth-photographable.ngrok-free.dev
- **Ngrok Dashboard:** http://localhost:4040
- **Статус:** ✅ Работает
- **Важно:** Этот URL нужен для Telegram WebApp (требуется HTTPS)

---

## 📱 Telegram Bot

- **Бот:** @BooklyTestOneBot (Bookly Demo Bot)
- **Организация:** Demo Org Test One
- **Статус:** ✅ Бот запущен и готов к работе

---

## 🔐 Учетные данные для входа

### Super Administrator
- **Email:** admin@system.com
- **Password:** admin123

**⚠️ ВАЖНО:** Измените пароль в production!

---

## 📋 Полезные ссылки

### API Endpoints
- **Health Check:** http://localhost:4000/api/health
- **API Base:** http://localhost:4000/api
- **WebApp Admin:** http://localhost:4000/webapp/admin
- **Admin Panel (Static):** http://localhost:4000/admin-panel

### Логи
Все логи находятся в папке `logs/`:
- `logs/backend.log` - логи backend сервера
- `logs/landing.log` - логи landing page
- `logs/react-admin.log` - логи React админ панели
- `logs/ngrok.log` - логи ngrok туннеля

---

## 🛑 Остановка сервисов

Для остановки всех сервисов выполните:
```bash
./stop-all.sh
```

Или вручную:
```bash
pkill -f "npm run dev"
pkill -f "next dev"
pkill -f "ngrok"
```

---

## 📝 Примечания

1. **Telegram WebApp** требует HTTPS, поэтому используется ngrok туннель
2. **Backend** автоматически отдает собранную React панель для `/admin-panel`
3. Все сервисы запущены в режиме разработки (hot reload включен)
4. База данных: SQLite (`backend/prisma/dev.db`)

---

**Последнее обновление:** $(date)
**Все сервисы запущены и готовы к работе! 🎉**



