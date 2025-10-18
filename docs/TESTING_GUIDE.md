# Руководство по тестированию аутентификации

## Запуск приложения

### Backend (порт 4000)
```bash
cd backend
npm run dev
```

### Frontend (порт 4200)
```bash
cd admin-panel
npm start
```

## Тестирование в браузере

1. Откройте http://localhost:4200
2. Вы должны увидеть страницу логина
3. **Кнопка "Нет аккаунта? Зарегистрироваться" теперь видна** ✅
4. Нажмите на кнопку регистрации
5. Заполните форму регистрации:
   - Имя: Test User
   - Email: test@example.com
   - Название организации: Test Organization
   - Пароль: password123
   - Подтверждение пароля: password123
6. Нажмите "Зарегистрироваться"
7. После успешной регистрации вы должны быть перенаправлены на dashboard

## Тестирование логина

1. Если вы уже зарегистрированы, можете использовать те же данные для входа
2. Или зарегистрируйте нового пользователя
3. После входа вы должны увидеть dashboard с информацией о пользователе

## Проверка функций

- ✅ Регистрация нового пользователя
- ✅ Вход в систему
- ✅ Автоматическое обновление токенов
- ✅ Защищенные маршруты (auth guard)
- ✅ Logout функциональность
- ✅ Сохранение состояния пользователя

## API тестирование

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

## Статус
🎉 **Все готово для тестирования!**
