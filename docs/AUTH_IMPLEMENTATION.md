# Реализация аутентификации

## Обзор
Полная система аутентификации для Telegram бота записи на консультацию реализована с использованием JWT токенов (access + refresh).

## Backend (Node.js + Express)

### API Endpoints
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/refresh` - Обновление access токена
- `POST /api/auth/logout` - Выход из системы

### База данных
Добавлены модели:
- `Organization` - Организация
- `User` - Пользователь с ролями (OWNER, MANAGER)
- `UserRole` - Enum для ролей

### JWT Токены
- **Access Token**: 15 минут жизни
- **Refresh Token**: 7 дней жизни
- Автоматическое обновление токенов

## Frontend (Angular 20 + Material Design)

### Сервисы
- `AuthService` - Управление аутентификацией
- `AuthInterceptor` - Автоматическое добавление токенов к запросам
- `AuthGuard` - Защита маршрутов

### Функциональность
- Автоматическое обновление токенов при истечении
- Сохранение состояния пользователя
- Защищенные маршруты
- Logout функциональность

## Тестирование

### Backend API
```bash
# Регистрация
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "organizationName": "Test Organization"
  }'

# Логин
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Frontend
- Angular приложение доступно на http://localhost:4200
- Страницы логина и регистрации готовы
- Dashboard защищен auth guard

## Запуск

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd admin-panel
npm install
npm run dev
```

## Безопасность
- Пароли хешируются с помощью bcryptjs
- JWT токены подписываются секретными ключами
- Автоматическое обновление токенов
- Валидация входных данных с помощью Zod

## Статус
✅ Все задачи выполнены:
- API endpoints созданы
- JWT токены настроены
- Автоматическое обновление токенов
- Logout функциональность
- Полный цикл протестирован
