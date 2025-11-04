# 🎯 Appointments Bot

Full-featured multi-tenant appointment booking system with Telegram bot integration and web-based admin panel.

## 🏗️ Architecture

```
appointments-bot/
├── backend/          # Node.js + Express + Prisma + Telegram Bot
├── admin-panel-react/ # React Admin Panel
├── landing/          # Next.js Landing Page (multi-language)
├── scripts/          # Automation and deployment scripts
├── docs/             # Project documentation
└── docker-compose.yml # Docker configuration for production
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm
- Git

### Installation & Setup

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd appointments-bot
   ```

2. **Automated setup:**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Start development:**
   ```bash
   chmod +x scripts/dev.sh
   ./scripts/dev.sh
   ```

### Manual Setup

1. **Backend:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run seed
   npm run dev
   ```

2. **React Admin Panel:**
   ```bash
   cd admin-panel-react
   npm install
   npm run dev
   ```

3. **Landing Page:**
   ```bash
   cd landing
   npm install
   npm run dev
   ```

## 🌐 Available Services

- **Backend API:** http://localhost:4000
- **React Admin Panel:** http://localhost:4200
- **Landing Page:** http://localhost:3000
- **API Health Check:** http://localhost:4000/api/health

## 🔐 Authentication

### Super Administrator

- **Email:** admin@system.com
- **Password:** admin123

### User Roles

- `SUPER_ADMIN` - Full access to all functions
- `OWNER` - Organization owner with full access
- `MANAGER` - Organization manager with management access

## 📱 Telegram Bot

The bot is integrated with the system and provides:
- View available services
- Book appointments
- Manage bookings
- Receive notifications

### Bot Setup

1. Create a bot via [@BotFather](https://t.me/botfather)
2. Get bot token
3. Add token to `.env` file:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```

## 🗄️ Database

The system uses SQLite with Prisma ORM. Main entities:

- **Organizations** - organizations
- **Services** - services
- **Appointments** - appointment bookings
- **TimeSlots** - time slots
- **Users** - system users

### Migrations

```bash
cd backend
npx prisma migrate dev    # Create new migration
npx prisma migrate deploy # Apply migrations in production
npx prisma studio        # GUI for database
```

## 🐳 Docker Deployment

### Production

```bash
# Configure .env file
cp .env.example .env

# Start deployment
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Manual Start

```bash
docker-compose up -d
```

## 🌍 Multi-language

The system supports:
- 🇷🇺 Russian
- 🇺🇸 English  
- 🇮🇱 Hebrew

Language switching is available in the web panel and Telegram bot.

## 🎨 Themes

- Light theme (default)
- Dark theme
- Automatic switching based on system settings

## 📊 Features

### React Admin Panel
- 📈 Dashboard with analytics and statistics
- 📅 Appointment management with filtering
- 🏢 Organization management
- 🔧 Service management
- 🤖 AI Assistant with settings
- ⚙️ System settings
- 👤 User profile
- 🎨 Modern UI with Tailwind CSS

### API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - Authentication
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `GET /api/services` - List services
- `GET /api/organizations` - List organizations

## 🛠️ Development

### Project Structure

- **Backend:** Express.js with TypeScript, Prisma ORM, JWT authentication
- **Frontend:** React with Tailwind CSS
- **Bot:** Telegram Bot API with multi-language support
- **Database:** SQLite with migration to PostgreSQL support

### Useful Commands

```bash
# Generate slots
cd backend && npm run generate-slots

# Create super admin
cd backend && npm run create-super-admin

# Create test data
cd backend && npm run create-test-data

# Check slots
cd backend && npm run check-slots
```

## 📚 Documentation

Additional documentation is available in the `docs/` folder:
- [🚨 **Critical Features Roadmap**](docs/CRITICAL_FEATURES_ROADMAP.md) - **CRITICAL** - MVP features
- [📊 Project Status](docs/PROJECT_CHECKPOINT_2025.md) - Current project status
- [💼 Business Documentation](docs/business/) - Business plans and strategy
- [🔧 Development Guides](docs/development/) - Development guides
- [🚀 Deployment Guide](docs/deployment/) - Deployment instructions
- [🏗️ Architecture](docs/architecture/) - System architecture
- [🔌 API Documentation](docs/api/) - API documentation
- [🤖 Agent Prompts](docs/agent-prompts/) - Prompts for AI agents
- [📋 **Detailed Specification**](docs/PROJECT_DETAILED_SPECIFICATION.md) - Complete project specification
- [🤖 **Agent Onboarding**](AGENT_ONBOARDING_GUIDE.md) - Agent onboarding guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is distributed under the MIT license. See the `LICENSE` file for more information.

## 🆘 Support

If you have questions or issues:

1. Check the [documentation](docs/)
2. Create an [Issue](https://github.com/your-repo/issues)
3. Contact the development team

---

**Project Status:** ✅ Fully functional system ready for production
