# CODEMAP (auto-generated)

Эта карта создаётся автоматически при каждом push. Она нужна, чтобы ассистент мог **быстро понять весь проект** без расспросов.

- Ветка: `refs/heads/main`
- Сгенерировано: 2025-10-17T19:58:25.475Z

## Обзор структуры (файловое дерево)
- README.md
- package.json
- prisma/schema.prisma
- scripts/generate-codemap.ts
- scripts/generateSlots.ts
- scripts/seed.ts
- scripts/snapshot-all.ts
- src/api/index.ts
- src/api/routes/appointments.ts
- src/api/routes/services.ts
- src/api/routes/slots.ts
- src/api/routes/webapp.ts
- src/bot/handlers/booking.ts
- src/bot/handlers/bookingInline.ts
- src/bot/handlers/my.ts
- src/bot/handlers/start.ts
- src/bot/handlers/webappData.ts
- src/bot/index.ts
- src/bot/mw/i18n.ts
- src/i18n/index.ts
- src/i18n/lang/en.json
- src/i18n/lang/he.json
- src/i18n/lang/ru.json
- src/lib/env.ts
- src/lib/prisma.ts
- src/server.ts
- tsconfig.json

## Навигация по ключевым узлам

### API routes (Express)

- `src/api/routes/appointments.ts`
- `src/api/routes/services.ts`
- `src/api/routes/slots.ts`
- `src/api/routes/webapp.ts`

### Telegraf bot handlers

- `src/bot/handlers/booking.ts`
- `src/bot/handlers/bookingInline.ts`
- `src/bot/handlers/my.ts`
- `src/bot/handlers/start.ts`
- `src/bot/handlers/webappData.ts`

### Bot middlewares (i18n, etc.)

- `src/bot/mw/i18n.ts`

### i18n dictionaries

- `src/i18n/lang/en.json`
- `src/i18n/lang/he.json`
- `src/i18n/lang/ru.json`

### Lib (env, prisma, server)

- `src/lib/env.ts`
- `src/lib/prisma.ts`

### Prisma schema

- `prisma/schema.prisma`

## Ключевые файлы (содержимое, укорочено)

<details><summary><code>package.json</code></summary>

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "codemap": "ts-node scripts/generate-codemap.ts",
    "snapshot": "ts-node scripts/snapshot-all.ts",
    "slots:month": "tsx scripts/generateSlots.ts --days=31",
    "slots:weekends": "tsx scripts/generateSlots.ts --days=31 --weekends",
    "slots:custom": "tsx scripts/generateSlots.ts --days=31 --start=10 --end=18 --step=20 --cap=2",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "prisma:studio": "prisma studio"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "devDependencies": {
    "@types/node": "^24.8.1",
    "fast-glob": "^3.3.3",
    "globby": "^15.0.0",
    "prisma": "^6.17.1",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "tsx": "^4.20.6",
    "typescript": "^5.9.3"
  },
  "dependencies": {
    "@prisma/client": "^6.17.1",
    "date-fns": "^4.1.0",
    "date-fns-tz": "^3.2.0",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "telegraf": "^4.16.3",
    "zod": "^4.1.12"
  }
}

```
</details>

<details><summary><code>tsconfig.json</code></summary>

```json
{
    "compilerOptions": {
      "target": "ES2020",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "outDir": "dist",
      "rootDir": "src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true
    },
    "include": ["src"]
  }
  
```
</details>

<details><summary><code>src/api/index.ts</code></summary>

```ts
import express from "express";
import appointments from "./routes/appointments";
import services from "./routes/services";
import slots from "./routes/slots";
import webapp from "./routes/webapp";


export function createApi() {
const app = express();
app.use(express.json());


app.use("/api/appointments", appointments);
app.use("/api/services", services);
app.use("/api/slots", slots);
app.use("/webapp", webapp);


app.get("/health", (_, res) => res.json({ ok: true }));
return app;
}
```
</details>

<details><summary><code>src/bot/index.ts</code></summary>

```ts
import { Telegraf, session } from "telegraf";
import { ENV } from "../lib/env";
import { i18nMw } from "./mw/i18n";

import { handleStart, handleLang } from "./handlers/start";
import { handleBookingFlow, registerBookingCallbacks } from "./handlers/bookingInline";
import { handleMy, registerMyCallbacks } from "./handlers/my";
import { registerWebappDataHandler } from "./handlers/webappData";

export function createBot() {
  const bot = new Telegraf(ENV.TELEGRAM_BOT_TOKEN);

  // Логгер (полезно оставлять)
  bot.use(async (ctx, next) => {
    console.log("UPDATE:", ctx.updateType, ctx.message ? Object.keys(ctx.message) : []);
    return next();
  });

  bot.use(session());
  bot.use(i18nMw);

  // команды
  bot.start(handleStart());
  bot.command("lang", handleLang());
  bot.command("book", handleBookingFlow());
  bot.command("my", handleMy());

  // inline и webapp
  registerMyCallbacks(bot);
  registerWebappDataHandler(bot);

  // узнаём username бота → для диплинка из групп
  bot.telegram.getMe().then((me) => {
    registerBookingCallbacks(bot, me.username!);
  });

  return bot;
}

```
</details>

<details><summary><code>prisma/schema.prisma</code></summary>

```prisma
generator client {
provider = "prisma-client-js"
}


datasource db {
provider = "sqlite"
url = env("DATABASE_URL")
}


model Service {
id Int @id @default(autoincrement())
name String
description String?
durationMin Int // e.g., 30
slots Slot[]
appointments Appointment[]
}


model Slot {
  id         Int      @id @default(autoincrement())
  serviceId  Int
  service    Service  @relation(fields: [serviceId], references: [id])
  startAt    DateTime
  endAt      DateTime
  capacity   Int      @default(1)
  bookings   Appointment[]

  @@unique([serviceId, startAt]) // ← защищает от повторной генерации
}



model Appointment {
  id         Int      @id @default(autoincrement())
  chatId     String
  serviceId  Int
  service    Service  @relation(fields: [serviceId], references: [id])
  slotId     Int
  slot       Slot     @relation(fields: [slotId], references: [id])
  createdAt  DateTime @default(now())
  status     String   @default("confirmed")

  @@unique([slotId]) // <— добавили
}

```
</details>


> Для больших файлов показаны первые ~2000 символов.
