# Исправление CORS проблемы

## 🚨 Проблема
**CORS ошибка** блокировала запросы от frontend (localhost:4200) к backend (localhost:4000).

**Ошибка в консоли:**
```
Access to XMLHttpRequest at 'http://localhost:4000/api/auth/register' from origin 'http://localhost:4200' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Решение
Добавлен CORS middleware в backend API.

### Изменения в `/backend/src/api/index.ts`:
```typescript
import cors from "cors";

// CORS configuration
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Установленные зависимости:
```bash
npm install cors @types/cors
```

## 🧪 Тестирование

### CORS Preflight запрос:
```bash
curl -X OPTIONS http://localhost:4000/api/auth/register \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Результат:** ✅ CORS заголовки присутствуют
- `Access-Control-Allow-Origin: http://localhost:4200`
- `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type,Authorization`

### API регистрации:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:4200" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "organizationName": "New Organization"
  }'
```

**Результат:** ✅ Регистрация работает успешно

## 🎯 Статус
**CORS проблема полностью решена!**

Теперь frontend может успешно общаться с backend API. Регистрация должна работать в браузере без ошибок CORS.

## 🚀 Готово к тестированию
1. Откройте http://localhost:4200
2. Перейдите на страницу регистрации
3. Заполните форму
4. Нажмите "Зарегистрироваться"
5. ✅ Должно работать без CORS ошибок!
