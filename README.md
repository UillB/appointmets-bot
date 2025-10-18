# 🎯 Appointments Bot

Полнофункциональная система управления записями на прием с Telegram ботом и веб-панелью администратора.

## 🏗️ Архитектура

```
appointments-bot/
├── backend/          # Node.js + Express + Prisma + Telegram Bot
├── admin-panel/      # Angular 20 Admin Panel
├── scripts/          # Автоматизация и скрипты развертывания
├── docs/             # Документация проекта
└── docker-compose.yml # Docker конфигурация для продакшена
```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 20+ [[memory:2591400]]
- npm
- Git

### Установка и запуск

1. **Клонирование репозитория:**
   ```bash
   git clone <repository-url>
   cd appointments-bot
   ```

2. **Автоматическая настройка:**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Запуск в режиме разработки:**
   ```bash
   chmod +x scripts/dev.sh
   ./scripts/dev.sh
   ```

### Ручная настройка

1. **Backend:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run seed
   npm run dev
   ```

2. **Frontend:**
   ```bash
   cd admin-panel
   npm install
   npm run dev
   ```

## 🌐 Доступные сервисы

- **Backend API:** http://localhost:4000
- **Admin Panel:** http://localhost:4200
- **API Health Check:** http://localhost:4000/api/health

## 🔐 Аутентификация

### Супер-администратор
- **Email:** admin@system.com
- **Password:** admin123

### Роли пользователей
- `SUPER_ADMIN` - полный доступ ко всем функциям
- `ADMIN` - управление организациями и услугами
- `USER` - просмотр записей

## 📱 Telegram Bot

Бот интегрирован с системой и позволяет:
- Просматривать доступные услуги
- Записываться на прием
- Управлять своими записями
- Получать уведомления

### Настройка бота

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен бота
3. Добавьте токен в `.env` файл:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```

## 🗄️ База данных

Система использует SQLite с Prisma ORM. Основные сущности:

- **Organizations** - организации
- **Services** - услуги
- **Appointments** - записи на прием
- **TimeSlots** - временные слоты
- **Users** - пользователи системы

### Миграции

```bash
cd backend
npx prisma migrate dev    # Создание новой миграции
npx prisma migrate deploy # Применение миграций в продакшене
npx prisma studio        # GUI для работы с БД
```

## 🐳 Docker развертывание

### Продакшен

```bash
# Настройте .env файл
cp .env.example .env

# Запустите развертывание
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Ручной запуск

```bash
docker-compose up -d
```

## 🌍 Многоязычность

Система поддерживает:
- 🇷🇺 Русский
- 🇺🇸 Английский  
- 🇮🇱 Иврит

Переключение языков доступно в веб-панели и Telegram боте.

## 🎨 Темы

- Светлая тема (по умолчанию)
- Темная тема
- Автоматическое переключение по системным настройкам

## 📊 Функциональность

### Admin Panel
- 📈 Dashboard с аналитикой
- 📅 Управление записями с фильтрацией
- 🏢 Управление организациями
- 🔧 Управление услугами
- ⚙️ Настройки системы
- 👤 Профиль пользователя

### API Endpoints
- `GET /api/health` - проверка здоровья
- `POST /api/auth/login` - аутентификация
- `GET /api/appointments` - список записей
- `POST /api/appointments` - создание записи
- `GET /api/services` - список услуг
- `GET /api/organizations` - список организаций

## 🛠️ Разработка

### Структура проекта

- **Backend:** Express.js с TypeScript, Prisma ORM, JWT аутентификация
- **Frontend:** Angular 20 с Material Design, Standalone Components
- **Bot:** Telegram Bot API с многоязычной поддержкой
- **Database:** SQLite с возможностью миграции на PostgreSQL

### Полезные команды

```bash
# Генерация слотов
cd backend && npm run generate-slots

# Создание супер-админа
cd backend && npm run create-super-admin

# Создание тестовых данных
cd backend && npm run create-test-data

# Проверка слотов
cd backend && npm run check-slots
```

## 📚 Документация

Дополнительная документация находится в папке `docs/`:
- [📊 Project Status](docs/PROJECT_CHECKPOINT_2025.md) - текущий статус проекта
- [💼 Business Documentation](docs/business/) - бизнес-планы и стратегия
- [🔧 Development Guides](docs/development/) - руководства по разработке
- [🚀 Deployment Guide](docs/deployment/) - инструкции по развертыванию
- [🏗️ Architecture](docs/architecture/) - архитектура системы
- [🔌 API Documentation](docs/api/) - документация API
- [🤖 Agent Prompts](docs/agent-prompts/) - промпты для AI агентов

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для получения дополнительной информации.

## 🆘 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [документацию](docs/)
2. Создайте [Issue](https://github.com/your-repo/issues)
3. Свяжитесь с командой разработки

---

**Статус проекта:** ✅ Полностью функциональная система готова к продакшену
