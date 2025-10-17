# CODEMAP

**Generated:** 2025-10-17T20:27:51.252Z
**Root:** `.`

- Files: **90**
- Dirs: **32**
- Size: **25.4 MB**

## Tree

**./** (13 items, 25.4 MB)
├── **.github/** (1 items, 2.1 KB)
│   └── **workflows/** (2 items, 2.1 KB)
│       ├── `codemap.yml` (1.4 KB) — Дай воркфлоу право писать в репо
│       └── `docs.yml` (771 B)
├── **docs/** (1 items, 39.6 KB)
│   └── **code/** (7 items, 39.6 KB)
│       ├── **.github/** (1 items, 1.4 KB)
│       │   └── **workflows/** (1 items, 1.4 KB)
│       │       └── `codemap.yml.md` (1.4 KB) — .github/workflows/codemap.yml
│       ├── **prisma/** (1 items, 1.0 KB)
│       │   └── `schema.prisma.md` (1.0 KB) — prisma/schema.prisma
│       ├── **scripts/** (4 items, 9.7 KB)
│       │   ├── `generate-codemap.ts.md` (3.2 KB) — /*.ts", "src/*
│       │   ├── `generateSlots.ts.md` (4.2 KB) — Генератор слотов. По умолчанию: 31 день вперёд, Пн–Пт, 09:00–17:00, шаг 30 минут, capacity=1. Параметры можно переопределять аргументами CLI: tsx scripts/generateSlots.ts --days=31 --start=9 --end=17 --step=30 --cap=1 --weekends
│       │   ├── `seed.ts.md` (886 B) — scripts/seed.ts
│       │   └── `snapshot-all.ts.md` (1.5 KB) — /*.prisma", "scripts/*
│       ├── **src/** (5 items, 25.9 KB)
│       │   ├── **api/** (2 items, 5.9 KB)
│       │   │   ├── **routes/** (4 items, 5.4 KB)
│       │   │   │   ├── `appointments.ts.md` (834 B) — src/api/routes/appointments.ts
│       │   │   │   ├── `services.ts.md` (459 B) — src/api/routes/services.ts
│       │   │   │   ├── `slots.ts.md` (1.2 KB) — src/api/routes/slots.ts
│       │   │   │   └── `webapp.ts.md` (2.9 KB) — src/api/routes/webapp.ts
│       │   │   └── `index.ts.md` (519 B) — src/api/index.ts
│       │   ├── **bot/** (3 items, 12.8 KB)
│       │   │   ├── **handlers/** (5 items, 11.2 KB)
│       │   │   │   ├── `booking.ts.md` (488 B) — src/bot/handlers/booking.ts
│       │   │   │   ├── `bookingInline.ts.md` (5.1 KB) — src/bot/handlers/bookingInline.ts
│       │   │   │   ├── `my.ts.md` (2.5 KB) — /my — показать ближайшие записи пользователя
│       │   │   │   ├── `start.ts.md` (1.2 KB) — src/bot/handlers/start.ts
│       │   │   │   └── `webappData.ts.md` (1.9 KB) — src/bot/handlers/webappData.ts
│       │   │   ├── **mw/** (1 items, 489 B)
│       │   │   │   └── `i18n.ts.md` (489 B) — src/bot/mw/i18n.ts
│       │   │   └── `index.ts.md` (1.2 KB) — src/bot/index.ts
│       │   ├── **i18n/** (2 items, 5.0 KB)
│       │   │   ├── **lang/** (3 items, 4.3 KB)
│       │   │   │   ├── `en.json.md` (1.2 KB) — src/i18n/lang/en.json
│       │   │   │   ├── `he.json.md` (1.4 KB) — src/i18n/lang/he.json
│       │   │   │   └── `ru.json.md` (1.7 KB) — src/i18n/lang/ru.json
│       │   │   └── `index.ts.md` (726 B) — src/i18n/index.ts
│       │   ├── **lib/** (2 items, 1.0 KB)
│       │   │   ├── `env.ts.md` (916 B) — src/lib/env.ts
│       │   │   └── `prisma.ts.md` (120 B) — src/lib/prisma.ts
│       │   └── `server.ts.md` (1.2 KB) — src/server.ts
│       ├── `package.json.md` (1.2 KB) — package.json
│       ├── `README.md.md` (43 B) — README.md
│       └── `tsconfig.json.md` (313 B) — tsconfig.json
├── **generated/** (1 items, 23.5 MB)
│   └── **prisma/** (19 items, 23.5 MB)
│       ├── **runtime/** (9 items, 1.2 MB)
│       │   ├── `edge-esm.js` (166.2 KB) — # sourceMappingURL=edge-esm.js.map
│       │   ├── `edge.js` (166.7 KB) — # sourceMappingURL=edge.js.map
│       │   ├── `index-browser.d.ts` (11.6 KB) — Generates more strict variant of an enum which, unlike regular enum, throws on non-existing property access. This can be useful in following situations: - we have an API, that accepts both `undefined` and `SomeEnumType` as an input - enum …
│       │   ├── `index-browser.js` (34.6 KB) — # sourceMappingURL=index-browser.js.map
│       │   ├── `library.d.ts` (126.5 KB) — @param this
│       │   ├── `library.js` (197.9 KB) — # Versions
│       │   ├── `react-native.js` (178.3 KB) — # Versions
│       │   ├── `wasm-compiler-edge.js` (201.7 KB) — # Versions
│       │   └── `wasm-engine-edge.js` (128.9 KB) — # sourceMappingURL=wasm-engine-edge.js.map
│       ├── `client.d.ts` (23 B)
│       ├── `client.js` (125 B)
│       ├── `default.d.ts` (23 B)
│       ├── `default.js` (141 B)
│       ├── `edge.d.ts` (25 B)
│       ├── `edge.js` (4.3 KB) — Prisma Client JS version: 6.17.1 Query Engine version: 272a37d34178c2894197e17273bf937f25acdeac
│       ├── `index-browser.js` (5.8 KB) — Prisma Client JS version: 6.17.1 Query Engine version: 272a37d34178c2894197e17273bf937f25acdeac
│       ├── `index.d.ts` (21.8 KB) — Client
│       ├── `index.js` (4.9 KB) — Prisma Client JS version: 6.17.1 Query Engine version: 272a37d34178c2894197e17273bf937f25acdeac
│       ├── `libquery_engine-darwin.dylib.node` (20.1 MB)
│       ├── `package.json` (5.2 KB)
│       ├── `query_engine_bg.js` (15.4 KB)
│       ├── `query_engine_bg.wasm` (2.1 MB)
│       ├── `schema.prisma` (267 B) — This is your Prisma schema file,
│       ├── `wasm-edge-light-loader.mjs` (143 B)
│       ├── `wasm-worker-loader.mjs` (136 B)
│       ├── `wasm.d.ts` (25 B)
│       └── `wasm.js` (4.5 KB) — Prisma Client JS version: 6.17.1 Query Engine version: 272a37d34178c2894197e17273bf937f25acdeac
├── **prisma/** (3 items, 45.7 KB)
│   ├── `dev.db` (44.0 KB)
│   ├── `schema.prisma` (1.0 KB)
│   └── `seed.ts` (719 B) — backend/prisma/seed.ts
├── **scripts/** (4 items, 13.4 KB)
│   ├── `generate-all-code-index.ts` (3.3 KB) — Skip binary/heavy files in the index body; keep metadata only
│   ├── `generate-codemap.ts` (5.1 KB) — ...
│   ├── `generateSlots.ts` (4.2 KB) — Генератор слотов. По умолчанию: 31 день вперёд, Пн–Пт, 09:00–17:00, шаг 30 минут, capacity=1. Параметры можно переопределять аргументами CLI: tsx scripts/generateSlots.ts --days=31 --start=9 --end=17 --step=30 --cap=1 --weekends
│   └── `seed.ts` (856 B) — Очистим таблицы
├── **src/** (5 items, 25.2 KB)
│   ├── **api/** (2 items, 5.7 KB)
│   │   ├── **routes/** (4 items, 5.2 KB)
│   │   │   ├── `appointments.ts` (789 B)
│   │   │   ├── `services.ts` (418 B)
│   │   │   ├── `slots.ts` (1.1 KB)
│   │   │   └── `webapp.ts` (2.9 KB) — status{margin-top:8px; font-size:13px; color:#999}
│   │   └── `index.ts` (488 B)
│   ├── **bot/** (3 items, 12.5 KB)
│   │   ├── **handlers/** (5 items, 11.0 KB)
│   │   │   ├── `booking.ts` (446 B)
│   │   │   ├── `bookingInline.ts` (5.0 KB) — форматирование
│   │   │   ├── `my.ts` (2.5 KB) — /my — показать ближайшие записи пользователя
│   │   │   ├── `start.ts` (1.2 KB) — deep link: /start book_{serviceId} → сразу открыть календарь
│   │   │   └── `webappData.ts` (1.8 KB)
│   │   ├── **mw/** (1 items, 456 B)
│   │   │   └── `i18n.ts` (456 B)
│   │   └── `index.ts` (1.1 KB) — Логгер (полезно оставлять)
│   ├── **i18n/** (2 items, 4.9 KB)
│   │   ├── **lang/** (3 items, 4.2 KB)
│   │   │   ├── `en.json` (1.2 KB)
│   │   │   ├── `he.json` (1.3 KB)
│   │   │   └── `ru.json` (1.7 KB)
│   │   └── `index.ts` (694 B)
│   ├── **lib/** (2 items, 975 B)
│   │   ├── `env.ts` (887 B) — sanitize
│   │   └── `prisma.ts` (88 B)
│   └── `server.ts` (1.1 KB) — 1) Сначала поднимем HTTP — чтобы /health работал в любом случае
├── `.gitignore` (96 B)
├── `ALL_CODE_INDEX.md` (1.7 MB) — branch: ${{ github.ref_name }} ``` --- ### `.github/workflows/docs.yml` - Size: 771 B - Modified: 2025-10-17T20:24:03.861Z ``` name: Generate Docs (CODEMAP & ALL_CODE_INDEX) on: push: branches: [ "main" ] workflow_dispatch: permissions: co…
├── `CODEMAP.md` (9.0 KB) — CODEMAP
├── `package-lock.json` (100.1 KB)
├── `package.json` (1.2 KB)
├── `README.md` (250 B) — Appointments Bot
└── `tsconfig.json` (283 B)

> Notes are extracted from top file comments when available. Keep first JSDoc/line comment descriptive.