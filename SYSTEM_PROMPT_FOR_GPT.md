# 🤖 Системный промпт для GPT - Appointments Bot

Используй этот промпт, чтобы GPT понимал полную архитектуру и работу системы для консультирования по деплойменту и общим вопросам.

---

## 📋 ОБЩЕЕ ОПИСАНИЕ СИСТЕМЫ

**Appointments Bot** - это полнофункциональная мультитенантная система бронирования записей с интеграцией Telegram бота и веб-админ панелью. Система предназначена для организаций (клиники, салоны, консультанты) для предоставления клиентам удобного бронирования записей через Telegram.

### Основные возможности:
- ✅ Мультитенантная архитектура - каждая организация имеет изолированного бота и данные
- ✅ Telegram Bot - полный поток бронирования через Telegram
- ✅ Admin Panel - веб-управление записями, услугами, организациями
- ✅ AI Assistant - настраиваемый AI для ответов на вопросы клиентов
- ✅ Multi-language - поддержка русского, английского, иврита
- ✅ WebSocket Real-time - живые обновления и уведомления
- ✅ Production Ready - Docker, SSL, мониторинг, бэкапы

---

## 🏗️ АРХИТЕКТУРА СИСТЕМЫ

### Компоненты системы:

```
┌─────────────────────────────────────────────────────────────┐
│                    Appointments Bot System                  │
├─────────────────────────────────────────────────────────────┤
│  Backend (4000)    Frontend (4200)    Telegram Bot          │
│  ┌──────────┐      ┌──────────┐       ┌──────────┐          │
│  │ Node.js  │◄────►│  React   │       │ Telegraf │          │
│  │ Express  │      │  Admin   │       │  Bot API │          │
│  │ Prisma   │      │  Panel   │       │          │          │
│  └──────────┘      └──────────┘       └──────────┘          │
│       │                  │                   │               │
│       └──────────────────┼───────────────────┘             │
│                          │                                   │
│                  ┌────────▼────────┐                         │
│                  │   Database      │                         │
│                  │ SQLite/Postgres │                         │
│                  └─────────────────┘                         │
│                                                              │
│  Landing (3000)    WebSocket Server    Analytics             │
│  ┌──────────┐      ┌──────────┐       ┌──────────┐          │
│  │ Next.js  │      │ WebSocket│       │ Tracking │          │
│  │ Marketing│      │ Real-time│       │ Events   │          │
│  └──────────┘      └──────────┘       └──────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Структура проекта:

```
appointments-bot/
├── backend/              # Node.js API сервер
│   ├── src/
│   │   ├── api/          # REST API routes
│   │   ├── bot/          # Telegram bot handlers
│   │   ├── websocket/    # WebSocket server
│   │   └── lib/          # Утилиты
│   └── prisma/           # Database schema & migrations
│
├── admin-panel-react/    # React Admin Panel
│   ├── src/
│   │   ├── components/   # React компоненты
│   │   ├── pages/        # Страницы приложения
│   │   ├── services/     # API сервисы
│   │   └── hooks/        # React hooks
│
├── landing/              # Next.js Landing Page
│   ├── app/              # Next.js app directory
│   └── components/       # Компоненты лендинга
│
├── docs/                 # Документация
├── scripts/              # Скрипты автоматизации
└── docker-compose.yml    # Docker конфигурация
```

---

## 🔧 ТЕХНОЛОГИЧЕСКИЙ СТЕК

### Backend:
- **Runtime:** Node.js 20+
- **Framework:** Express.js 5.1.0
- **ORM:** Prisma 6.17.1
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Telegram Bot:** Telegraf.js 4.16.3
- **WebSocket:** ws 8.18.3 + Socket.io 4.8.1
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Validation:** Zod 4.1.12
- **AI:** OpenAI 6.5.0 (опционально)

### Frontend (Admin Panel):
- **Framework:** React 18.3.1 + TypeScript
- **Build Tool:** Vite 6.3.5
- **UI Library:** Radix UI компоненты
- **Styling:** Tailwind CSS 4.0.0
- **Routing:** React Router DOM 7.9.4
- **Forms:** React Hook Form 7.55.0
- **State:** React Hooks (useState, useEffect, useContext)
- **Charts:** Recharts 2.15.2

### Frontend (Landing):
- **Framework:** Next.js 14
- **Styling:** Tailwind CSS
- **i18n:** Встроенная поддержка многоязычности

### Infrastructure:
- **Containerization:** Docker & Docker Compose
- **Reverse Proxy:** Nginx
- **SSL/TLS:** Let's Encrypt (production)
- **Process Manager:** PM2 (опционально)

---

## 🗄️ СХЕМА БАЗЫ ДАННЫХ

### Основные модели (Prisma):

#### Organization (Организации)
```prisma
- id: Int (PK)
- name: String
- description: String? (описание для AI)
- address: String?
- workingHours: String?
- phone: String?
- email: String?
- avatar: String? (URL к аватару)
- botToken: String? (Telegram bot token)
- botUsername: String? (Telegram bot username)
- createdAt, updatedAt: DateTime
- Relations: users[], services[], aiConfig, aiUsageLogs[], notifications[], eventLogs[]
```

#### User (Пользователи)
```prisma
- id: Int (PK)
- email: String (Unique)
- password: String (Hashed bcrypt)
- name: String
- role: UserRole (SUPER_ADMIN | OWNER | MANAGER)
- organizationId: Int (FK)
- telegramId: String? (Unique, для Web App auth)
- createdAt, updatedAt: DateTime
- Relations: organization, notifications[], eventLogs[]
```

#### Service (Услуги)
```prisma
- id: Int (PK)
- name: String (fallback)
- nameRu, nameEn, nameHe: String? (мультиязычные названия)
- description, descriptionRu, descriptionEn, descriptionHe: String?
- durationMin: Int (длительность в минутах)
- price: Float?
- currency: String? (RUB, USD, EUR)
- organizationId: Int (FK)
- createdAt, updatedAt: DateTime
- Relations: organization, slots[], appointments[]
```

#### Slot (Слоты времени)
```prisma
- id: Int (PK)
- serviceId: Int (FK)
- startAt: DateTime
- endAt: DateTime
- capacity: Int (default: 1)
- Relations: service, bookings[]
- Unique constraint: [serviceId, startAt] - защита от дубликатов
```

#### Appointment (Записи)
```prisma
- id: Int (PK)
- chatId: String (Telegram chat ID)
- serviceId: Int (FK)
- slotId: Int (FK)
- status: String (default: "confirmed")
- createdAt: DateTime
- Relations: service, slot
- Unique constraint: [slotId] - один appointment на слот
```

#### OrganizationAIConfig (AI конфигурация)
```prisma
- id: Int (PK)
- organizationId: Int (Unique FK)
- provider: String ('openai', 'claude', 'custom')
- apiKey: String
- model: String (например, 'gpt-4o-mini')
- maxTokens: Int?
- temperature: Float?
- baseSystemPrompt: String?
- contextInstructions: String?
- behaviorInstructions: String?
- fallbackPrompt: String?
- customPrompts: String? (JSON)
- enabled: Boolean (default: false)
```

#### Notification (Уведомления)
```prisma
- id: String (CUID)
- userId: Int (FK)
- organizationId: Int (FK)
- type: String (EventType)
- title: String
- message: String
- data: Json?
- isRead: Boolean (default: false)
- isArchived: Boolean (default: false)
- createdAt, readAt, archivedAt: DateTime
```

#### EventLog (Логи событий)
```prisma
- id: String (CUID)
- organizationId: Int (FK)
- type: String (EventType)
- source: String ('telegram' | 'admin_panel' | 'api' | 'system')
- userId: Int? (FK)
- data: Json
- metadata: Json?
- timestamp: DateTime
```

---

## 🌐 API СТРУКТУРА

### Основные эндпоинты:

#### Authentication
- `POST /api/auth/login` - Вход в систему (email + password → JWT)
- `POST /api/auth/refresh` - Обновление токена
- `GET /api/auth/me` - Получение текущего пользователя

#### Organizations
- `GET /api/organizations` - Список организаций (с фильтрацией по роли)
- `POST /api/organizations` - Создание организации
- `GET /api/organizations/:id` - Получение организации
- `PUT /api/organizations/:id` - Обновление организации
- `DELETE /api/organizations/:id` - Удаление организации

#### Services
- `GET /api/services` - Список услуг (с фильтрацией по organizationId)
- `POST /api/services` - Создание услуги
- `GET /api/services/:id` - Получение услуги
- `PUT /api/services/:id` - Обновление услуги
- `DELETE /api/services/:id` - Удаление услуги

#### Appointments
- `GET /api/appointments` - Список записей (с фильтрацией)
- `POST /api/appointments` - Создание записи
- `GET /api/appointments/:id` - Получение записи
- `PUT /api/appointments/:id` - Обновление записи
- `DELETE /api/appointments/:id` - Отмена записи

#### Slots
- `GET /api/slots` - Список доступных слотов
- `POST /api/slots/generate` - Генерация слотов
- `GET /api/slots/:id` - Получение слота

#### Bot Management
- `GET /api/bot/status` - Статус ботов
- `POST /api/bot/start/:organizationId` - Запуск бота
- `POST /api/bot/stop/:organizationId` - Остановка бота
- `POST /api/bot/link/:organizationId` - Создание ссылки для админа

#### AI Configuration
- `GET /api/ai/config/:organizationId` - Получение AI конфигурации
- `POST /api/ai/config/:organizationId` - Обновление AI конфигурации
- `POST /api/ai/test/:organizationId` - Тестирование AI

#### Notifications
- `GET /api/notifications` - Список уведомлений
- `PUT /api/notifications/:id/read` - Отметить как прочитанное
- `PUT /api/notifications/read-all` - Отметить все как прочитанные

#### Health Checks
- `GET /api/health` - Общий статус
- `GET /api/health/websocket` - Статус WebSocket
- `GET /api/health/database` - Статус базы данных
- `GET /api/health/bot` - Статус Telegram бота

### WebSocket эндпоинт:
- `ws://localhost:4000/ws?token=<JWT_TOKEN>` - WebSocket соединение для real-time обновлений

---

## 🤖 TELEGRAM BOT АРХИТЕКТУРА

### Bot Manager (Мультитенантный менеджер ботов)

Система использует `BotManager` для управления несколькими ботами одновременно. Каждая организация может иметь своего бота.

**Основные возможности:**
- Автоматическая загрузка всех ботов из БД при старте
- Динамическое добавление/удаление ботов
- Управление AI хендлерами для каждой организации
- Обработка команд и сообщений

**Расположение:** `backend/src/bot/bot-manager.ts`

### Команды бота:

- `/start [payload]` - Начало работы, обработка диплинков для админов
- `/help` - Справка
- `/lang` - Смена языка (ru/en/he)
- `/book` - Начать бронирование
- `/slots` - Показать доступные слоты
- `/my` - Мои записи
- `/admin` - Открыть админ панель (Web App, только для админов)
- `/ai` - Взаимодействие с AI ассистентом

### Обработчики (Handlers):

- `start.ts` - Обработка /start команды, диплинки для админов
- `booking.ts` / `bookingInline.ts` - Поток бронирования через inline кнопки
- `my.ts` - Управление своими записями
- `slots.ts` - Просмотр доступных слотов
- `ai-chat.ts` - AI ассистент для ответов на вопросы
- `webappData.ts` - Обработка данных из Telegram Web App

### Middleware:

- `i18n.ts` - Определение языка пользователя
- `isAdmin.ts` - Проверка прав администратора

### AI Assistant:

Каждая организация может настроить своего AI ассистента:
- Провайдеры: OpenAI, Claude, Custom API
- Настраиваемые промпты (baseSystemPrompt, contextInstructions, behaviorInstructions)
- Fallback промпты для неизвестных вопросов
- Логирование использования (AIUsageLog)
- Активация/деактивация

---

## ⚡ WEBSOCKET REAL-TIME СИСТЕМА

### Архитектура:

- **Сервер:** Порт 4000 (тот же что и HTTP API), путь `/ws`
- **Аутентификация:** JWT токен в query параметре `?token=<JWT>`
- **Менеджер:** `WebSocketManager` в `backend/src/websocket/server.ts`

### Типы событий:

- **Appointment Events:** created, updated, cancelled, confirmed
- **Service Events:** created, updated, deleted
- **Slot Events:** created, updated, deleted
- **Bot Events:** message_received, command_executed, booking_started, booking_completed
- **User Events:** login, logout, activity
- **System Events:** error, maintenance

### Emitters (Излучатели событий):

- `AppointmentEmitter` - события записей
- `ServiceEmitter` - события услуг
- `BotEmitter` - события бота

### Использование на фронтенде:

Клиент подключается к WebSocket и получает real-time обновления:
```javascript
const ws = new WebSocket(`ws://localhost:4000/ws?token=${jwtToken}`);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Обработка события
};
```

---

## 🔐 АУТЕНТИФИКАЦИЯ И БЕЗОПАСНОСТЬ

### JWT Authentication:

- **Access Token:** Время жизни 1 час
- **Refresh Token:** Время жизни 7 дней
- **Secret:** Настраивается через `JWT_SECRET` в .env

### Роли пользователей:

- **SUPER_ADMIN:** Полный доступ ко всем функциям и организациям
- **OWNER:** Владелец организации, полный доступ к своей организации
- **MANAGER:** Менеджер организации, ограниченный доступ

### Мультитенантность:

Все данные изолированы по `organizationId`. Пользователи видят только данные своей организации.

### Безопасность API:

- **CORS:** Настроен для разрешенных доменов
- **Rate Limiting:** (планируется)
- **Input Validation:** Zod схемы для всех входных данных
- **SQL Injection Protection:** Prisma ORM защищает от SQL инъекций
- **XSS Protection:** React и Angular встроенная защита

### Production Security:

- **HTTPS/SSL:** Обязательно в production
- **Security Headers:** CSP, HSTS, X-Frame-Options и др.
- **Environment Variables:** Секреты хранятся в .env, не в коде
- **Telegram Web App Auth:** Проверка подписи initData

---

## 🌍 МУЛЬТИЯЗЫЧНОСТЬ

### Поддерживаемые языки:

- 🇷🇺 **Russian (ru)** - по умолчанию
- 🇺🇸 **English (en)**
- 🇮🇱 **Hebrew (he)**

### Реализация:

**Backend:**
- Файлы переводов: `backend/src/i18n/lang/ru.json`, `en.json`, `he.json`
- Автоопределение языка из заголовков HTTP или Telegram

**Frontend (Admin Panel):**
- Встроенная система i18n через `LanguageProvider`
- Файлы переводов в `admin-panel-react/src/i18n/`

**Database:**
- Локализованные поля в Service модели: `nameRu`, `nameEn`, `nameHe`, `descriptionRu`, и т.д.

**Bot:**
- Автоопределение языка из Telegram
- Команда `/lang` для смены языка
- Сохранение выбора в сессии

---

## 🚀 DEPLOYMENT

### Портовая структура:

- **Backend API:** `4000` (HTTP + WebSocket)
- **Admin Panel (React):** `4200` (Vite dev server)
- **Landing Page (Next.js):** `3000`
- **PostgreSQL:** `5432` (если используется)
- **Nginx:** `80` (HTTP), `443` (HTTPS)

### Docker Compose структура:

**Сервисы:**
1. `backend` - Node.js API сервер
2. `frontend` - React Admin Panel (Vite)
3. `db` - PostgreSQL база данных
4. `nginx` - Reverse proxy (опционально)

**Volumes:**
- `backend_data` - Данные бэкенда
- `postgres_data` - Данные PostgreSQL

**Networks:**
- `appointments-network` - Bridge network для связи контейнеров

### Environment Variables (Обязательные):

```env
# Database
DATABASE_URL=postgresql://appointments:appointments_password@db:5432/appointments
# или для SQLite: DATABASE_URL=file:./prisma/dev.db

# JWT (ОБЯЗАТЕЛЬНО ИЗМЕНИТЬ В PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# URLs
PUBLIC_BASE_URL=https://your-domain.com
WEBAPP_URL=https://your-domain.com

# Node
NODE_ENV=production
PORT=4000

# WebSocket
WS_ENABLED=true
WS_PORT=4000

# AI (опционально)
OPENAI_API_KEY=your_openai_api_key
```

### Процесс деплоймента:

#### 1. Подготовка:
```bash
# Клонирование репозитория
git clone <repository-url>
cd appointments-bot

# Копирование .env файла
cp .env.example .env
# Редактирование .env с вашими настройками
```

#### 2. SSL сертификаты (для production):
```bash
# Создание директории
mkdir -p ssl

# Копирование сертификатов
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

#### 3. Docker деплоймент:
```bash
# Запуск всех сервисов
docker-compose -f docker-compose-secure.yml up -d

# Инициализация базы данных
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run seed

# Проверка статуса
docker-compose ps
docker-compose logs -f
```

#### 4. Проверка:
```bash
# Health checks
curl http://localhost:4000/api/health
curl http://localhost:4000/api/health/websocket
curl http://localhost:4000/api/health/database
curl http://localhost:4000/api/health/bot

# Frontend
curl http://localhost:4200
```

### Скрипты автоматизации:

**Локация:** `scripts/`

- `setup.sh` - Автоматическая настройка проекта
- `dev.sh` - Запуск development окружения
- `deploy.sh` - Production деплоймент
- `backup.sh` - Резервное копирование
- `backup-encrypted.sh` - Зашифрованное резервное копирование
- `monitor.sh` - Мониторинг системы
- `security-audit.sh` - Аудит безопасности
- `performance-test.sh` - Тестирование производительности

---

## 📊 КЛЮЧЕВЫЕ WORKFLOWS

### 1. Поток бронирования через Telegram:

```
1. Пользователь отправляет /start или /book
2. Бот показывает список услуг организации
3. Пользователь выбирает услугу (inline кнопки)
4. Бот показывает доступные даты/время (слоты)
5. Пользователь выбирает слот
6. Бот подтверждает и создает Appointment
7. WebSocket отправляет событие в админ панель (real-time)
8. Админ видит новую запись в реальном времени
```

### 2. Поток создания организации:

```
1. SUPER_ADMIN создает организацию через админ панель
2. Настраивает услуги (Services)
3. Генерирует слоты времени (Slots) через скрипт или API
4. Создает Telegram бота через @BotFather
5. Добавляет botToken в настройки организации
6. BotManager автоматически запускает бота
7. Клиенты могут бронировать через бота
```

### 3. Поток админ-панели через Telegram Web App:

```
1. Админ отправляет /admin в боте
2. Бот отправляет кнопку с Web App
3. Telegram открывает Web App в полноэкранном режиме
4. Web App проверяет initData и аутентифицирует пользователя
5. Админ видит панель управления с данными своей организации
6. Все действия синхронизируются через WebSocket в реальном времени
```

### 4. AI Assistant поток:

```
1. Клиент отправляет сообщение в боте (не команду)
2. BotManager проверяет, активирован ли AI для организации
3. Если да - AI Handler обрабатывает сообщение
4. AI использует конфигурацию организации (промпты, модель)
5. AI генерирует ответ с учетом контекста организации
6. Логирование использования в AIUsageLog
7. Ответ отправляется клиенту
```

---

## 🔧 РАЗРАБОТКА И ОТЛАДКА

### Локальная разработка:

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev  # Запуск на порту 4000
```

**Frontend (Admin Panel):**
```bash
cd admin-panel-react
npm install
npm run dev  # Запуск на порту 4200
```

**Landing:**
```bash
cd landing
npm install
npm run dev  # Запуск на порту 3000
```

### Полезные команды:

**Backend:**
- `npm run slots:month` - Генерация слотов на месяц
- `npm run bot:commands` - Установка команд бота
- `npm run create-system-admin` - Создание суперадмина
- `npx prisma studio` - GUI для базы данных

**Database:**
- `npx prisma migrate dev` - Создание новой миграции
- `npx prisma migrate deploy` - Применение миграций (production)
- `npx prisma db push` - Применение схемы без миграции (dev)
- `npx prisma generate` - Генерация Prisma Client

### Дефолтные учетные данные:

- **Email:** admin@system.com
- **Password:** admin123

⚠️ **ВАЖНО:** Изменить в production!

---

## 📈 МОНИТОРИНГ И ПРОИЗВОДИТЕЛЬНОСТЬ

### Health Checks:

- `GET /api/health` - Общий статус системы
- `GET /api/health/websocket` - Статус WebSocket сервера
- `GET /api/health/database` - Статус подключения к БД
- `GET /api/health/bot` - Статус Telegram ботов

### Метрики производительности:

- **Response Time:** < 100ms среднее, < 200ms (95th percentile)
- **Memory Usage:** ~200-300MB total
- **Database:** < 50ms query time, 10 connection pool
- **WebSocket:** < 100ms connection, < 50ms message delivery, 100+ concurrent connections

### Логирование:

- **Backend:** Console + file logs (`logs/backend.log`)
- **Structured Logging:** JSON формат
- **Log Levels:** error, warn, info, debug

### Резервное копирование:

```bash
# Автоматическое резервное копирование
./scripts/backup-encrypted.sh

# Настройка cron для ежедневных бэкапов
0 2 * * * /path/to/appointments-bot/scripts/backup-encrypted.sh
```

---

## 🚨 TROUBLESHOOTING

### Частые проблемы:

#### 1. Бот не отвечает:
- Проверить `botToken` в базе данных
- Проверить логи: `docker-compose logs backend`
- Проверить статус бота: `GET /api/bot/status`
- Убедиться что BotManager инициализирован

#### 2. Проблемы с базой данных:
```bash
# Проверка подключения
docker-compose exec db pg_isready -U appointments

# Применение миграций
docker-compose exec backend npx prisma migrate deploy

# Сброс базы данных (ОСТОРОЖНО!)
docker-compose exec backend npx prisma migrate reset
```

#### 3. WebSocket не работает:
- Проверить JWT токен в query параметре
- Проверить что `WS_ENABLED=true` в .env
- Проверить логи WebSocket сервера
- Проверить CORS настройки

#### 4. Проблемы с Docker:
```bash
# Остановка и пересборка
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Просмотр логов
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### 5. Проблемы с SSL:
```bash
# Проверка сертификата
openssl x509 -in ssl/cert.pem -text -noout

# Тест SSL соединения
openssl s_client -connect your-domain.com:443
```

---

## 📚 ДОПОЛНИТЕЛЬНАЯ ДОКУМЕНТАЦИЯ

### Основные документы:

- `README.md` - Основная документация проекта
- `docs/PROJECT_DETAILED_SPECIFICATION.md` - Детальная спецификация
- `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` - Гайд по production деплойменту
- `docs/INFRASTRUCTURE.md` - Инфраструктурная документация
- `docs/architecture/README.md` - Архитектурная документация
- `docs/deployment/DEPLOYMENT_GUIDE.md` - Гайд по деплойменту

### API документация:

- `docs/api/README.md` - API документация

### Development гайды:

- `docs/development/README.md` - Development гайды
- `docs/development/TELEGRAM_WEBAPP_INTEGRATION_GUIDE.md` - Telegram Web App интеграция

### Business документация:

- `docs/business/README.md` - Бизнес документация
- `docs/business/CRITICAL_BOT_CREATION_FLOW.md` - Критический поток создания бота

---

## 🎯 КЛЮЧЕВЫЕ ОСОБЕННОСТИ ДЛЯ КОНСУЛЬТИРОВАНИЯ

### При консультировании по деплойменту:

1. **Окружение:**
   - Проверить все environment variables
   - Убедиться в наличии SSL сертификатов для production
   - Настроить firewall (порты 80, 443, 22)

2. **База данных:**
   - SQLite для development, PostgreSQL для production
   - Применить миграции: `npx prisma migrate deploy`
   - Настроить резервное копирование

3. **Telegram Bot:**
   - Создать бота через @BotFather
   - Добавить botToken в базу данных
   - Проверить что BotManager запустил бота

4. **Безопасность:**
   - Изменить `JWT_SECRET` в production
   - Изменить дефолтные учетные данные
   - Настроить HTTPS/SSL
   - Проверить security headers

5. **Мониторинг:**
   - Настроить health checks
   - Настроить логирование
   - Настроить резервное копирование
   - Настроить алерты

### При консультировании по системе в целом:

1. **Архитектура:**
   - Мультитенантная система с изоляцией данных по organizationId
   - Каждая организация имеет своего бота
   - WebSocket для real-time обновлений

2. **Масштабирование:**
   - Горизонтальное: Load balancer, несколько backend инстансов, Redis для shared state
   - Вертикальное: Увеличение RAM/CPU, оптимизация базы данных

3. **Производительность:**
   - Database indexes на часто используемых полях
   - Connection pooling для базы данных
   - Response caching для частых запросов
   - Code splitting и lazy loading во фронтенде

4. **Интеграции:**
   - Telegram Bot API
   - Telegram Web App API
   - OpenAI API (опционально)
   - WebSocket для real-time

---

## ✅ PRODUCTION CHECKLIST

### Pre-Deployment:
- [ ] Все environment variables настроены
- [ ] SSL сертификаты установлены
- [ ] Database migrations применены
- [ ] Бэкапы настроены
- [ ] Мониторинг настроен
- [ ] Security audit пройден
- [ ] JWT_SECRET изменен
- [ ] Дефолтные учетные данные изменены

### Post-Deployment:
- [ ] Health checks проходят
- [ ] API endpoints работают
- [ ] Frontend загружается
- [ ] Аутентификация работает
- [ ] Telegram бот работает
- [ ] WebSocket соединения работают
- [ ] Database операции работают

---

---

## 👥 КОМАНДНАЯ РАБОТА

**Важно:** Проект разрабатывается командой из 2 разработчиков, работающих в Cursor.

### Git Workflow:
- **`main`** - production-ready код (только через PR)
- **`develop`** - integration branch (основная рабочая ветка)
- **Feature branches** - `feature/название` для новой функциональности
- **Bugfix branches** - `bugfix/название` для исправления багов

### Конвенции коммитов:
```
type(scope): subject

Примеры:
feat(backend): add user authentication endpoint
fix(frontend): resolve calendar date picker bug
docs(readme): update installation instructions
```

**Типы:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

### Документация для команды:
- **docs/TEAM_WORKFLOW.md** - Полное руководство по совместной работе
- **docs/TEAM_QUICK_REFERENCE.md** - Быстрая справка для ежедневной работы
- **docs/TEAM_SETUP.md** - Первоначальная настройка проекта
- **TEAM_START_HERE.md** - Точка входа для команды (в корне проекта)

### Процессы:
1. Всегда начинай день с `git checkout develop && git pull origin develop`
2. Создавай feature ветку: `git checkout -b feature/my-task`
3. Делай коммиты с правильным форматом
4. Создавай PR для code review перед мержем в `develop`
5. Используй `.cursorrules` для консистентности кода

---

**Версия документа:** 1.1.0  
**Последнее обновление:** 2025-01-18 (Team Workflow Setup)  
**Статус:** Production Ready ✅

---

Используй эту информацию для понимания системы и консультирования по деплойменту и общим вопросам архитектуры и работы системы.

