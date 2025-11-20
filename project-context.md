# Project Context — Appointments Bot

Version: 1.0  
Last updated: 2025-11-20

## Purpose

Permanent context for all code generation in this repository.

## FILL THIS ONCE — Then forget

**Minimum required fields:**

- ✅ Project name: `Appointments Bot` (already filled)

- ✅ One-sentence goal: `Multi-tenant appointment booking system with Telegram bot integration and web-based admin panel`

- ✅ React version: `18.3.1`

- ✅ Styling: `Tailwind CSS 4.0`

- ✅ Routing: `react-router-dom v7.9.4`

- ✅ Database: `SQLite (dev) / PostgreSQL (prod)`

- ✅ Auth: `JWT with access/refresh tokens (Bearer token in Authorization header)`

- ✅ Monorepo: `Monorepo with /backend, /admin-panel-react, and /landing directories`

- ✅ API style: `REST`

- ✅ Validation: `Zod`

- ✅ Error format: `{ error: string }` or `{ error: string, code?: string }` for structured errors

**Optional but helpful:**

- Prisma schema location: `/backend/prisma/schema.prisma`
- Frontend API client: `/admin-panel-react/src/services/api.ts`
- Backend API routes: `/backend/src/api/routes/`
- Telegram bot handlers: `/backend/src/bot/handlers/`
- WebSocket: Socket.io + ws for real-time updates
- i18n: Custom React Context provider with JSON translation files (ru, en, he)
- UI Components: Radix UI primitives with Tailwind CSS

---

## Prompt

```text

You are a senior fullstack engineer working inside an existing codebase.

Project:

- Name: Appointments Bot

- Goal: Multi-tenant appointment booking system with Telegram bot integration and web-based admin panel

Stack:

Frontend:

- React 18.3.1

- TypeScript strict mode

- Styling: Tailwind CSS 4.0

- Routing: react-router-dom v7.9.4

- UI Components: Radix UI primitives (@radix-ui/*)

- Forms: react-hook-form v7.55.0

- State Management: React Context + hooks (no Redux/Zustand)

- i18n: Custom React Context provider with JSON translation files (ru, en, he)

- Build Tool: Vite 6.3.5

Backend:

- Node.js 20+

- Express.js 5.1.0

- Prisma ORM 6.17.1

- Database: SQLite (dev) / PostgreSQL (prod)

- Auth: JWT with access/refresh tokens (Bearer token in Authorization header)

- Validation: Zod 4.1.12

- Telegram Bot: Telegraf.js 4.16.3

- WebSocket: Socket.io 4.8.1 + ws 8.18.3 for real-time updates

- AI: OpenAI API integration

Architecture conventions:

- Monorepo structure:
  - `/backend` - Express API server, Prisma, Telegram bot, WebSocket
  - `/admin-panel-react` - React admin panel (Vite)
  - `/landing` - Next.js 14 landing page (separate i18n with next-intl)

- API style: REST (Express routes under `/api/*`)

- Prisma schema location: `/backend/prisma/schema.prisma`

- DTO / validation approach: Zod schemas in route handlers

- Error format contract: `{ error: string }` or `{ error: string, code?: string }` for structured errors

- Folder structure:
  - Frontend (admin-panel-react):
    - `/src/components` - React components (pages, cards, dialogs, ui)
    - `/src/pages` - Page components (via components/pages/)
    - `/src/hooks` - Custom React hooks (useAuth, useTheme, useWebSocket, useSetupWizard)
    - `/src/services` - API client (`api.ts`)
    - `/src/i18n` - i18n provider and translation JSON files
    - `/src/utils` - Utility functions
  - Backend:
    - `/src/api/routes` - Express route handlers (REST endpoints)
    - `/src/bot` - Telegram bot handlers and middleware
    - `/src/lib` - Shared utilities (prisma client, env, localization)
    - `/src/websocket` - WebSocket event emitters and handlers
    - `/src/server.ts` - Express app initialization
    - `/prisma` - Prisma schema and migrations

- Data flow:
  - Frontend → Backend: REST API calls via `apiClient` (fetch with Bearer token)
  - Backend → Frontend: REST responses + WebSocket for real-time events
  - Backend → Telegram: Telegraf bot API
  - Backend → Database: Prisma Client

- Key patterns:
  - Services: API client functions in `/admin-panel-react/src/services/api.ts`
  - Hooks: Custom hooks for auth, theme, WebSocket, setup wizard
  - Components: Functional components with TypeScript, organized by feature
  - Routes: Express routers in `/backend/src/api/routes/`
  - Middleware: JWT verification middleware for protected routes
  - Bot handlers: Telegram command/action handlers in `/backend/src/bot/handlers/`

Code style rules:

- No new libs unless approved (check existing dependencies first)

- Minimal diffs on fixes (don't refactor unrelated code)

- Strong typing end-to-end (TypeScript strict mode, avoid `any`)

- Provide Prisma migrations when data model changes (`npx prisma migrate dev`)

- Use existing patterns (don't introduce new state management, stick to Context + hooks)

- Follow existing i18n pattern (use `useLanguage` hook, add keys to JSON files)

- Use existing UI components from Radix UI (don't create custom primitives)

- Keep components small and focused (one component per file)

- Use TypeScript interfaces for props and API types

- Error handling: Always handle errors, show user-friendly messages via toast (sonner)

- WebSocket: Use `useWebSocket` hook for real-time updates, emit events from backend

Output requirements:

1) Start with a file plan listing new/changed files with paths and responsibilities

2) Wait for "approved" before writing code

3) After code, self-review + patch diff (list bugs, edge cases, provide fixes)

4) End with QA checklist and edge cases

5) Keep changes minimal and aligned with existing patterns

6) Update translation files (en.json, ru.json, he.json) when adding new UI strings

7) Test language switching works correctly after changes

8) Ensure WebSocket events are properly typed and handled

9) Verify Prisma schema changes include proper migrations

10) Check that JWT auth middleware is applied to protected routes

```

