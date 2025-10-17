# scripts/generateSlots.ts

```ts
// backend/scripts/generateSlots.ts
import { prisma } from "../src/lib/prisma";

/**
 * Генератор слотов.
 * По умолчанию: 31 день вперёд, Пн–Пт, 09:00–17:00, шаг 30 минут, capacity=1.
 * Параметры можно переопределять аргументами CLI:
 *   tsx scripts/generateSlots.ts --days=31 --start=9 --end=17 --step=30 --cap=1 --weekends
 */

const DAYS_AHEAD = argInt("--days", 31);
const START_HOUR = argInt("--start", 9);   // UTC hour (inclusive)
const END_HOUR   = argInt("--end", 17);    // UTC hour (exclusive)
const STEP_MIN   = argInt("--step", 30);
const CAPACITY   = argInt("--cap", 1);
const WEEKENDS   = argFlag("--weekends", false);

function argInt(name: string, def: number) {
  const a = process.argv.find((x) => x.startsWith(name + "="));
  return a ? parseInt(a.split("=")[1], 10) : def;
}
function argFlag(name: string, def: boolean) {
  return process.argv.includes(name) ? true : def;
}
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

async function main() {
  console.log("🧩 Генерация слотов…", {
    DAYS_AHEAD, START_HOUR, END_HOUR, STEP_MIN, CAPACITY, WEEKENDS,
  });

  // (необязательно) удаляем уже прошедшие слоты — удобно для демо
  const now = new Date();
  await prisma.slot.deleteMany({ where: { endAt: { lt: now } } });

  const services = await prisma.service.findMany();
  if (!services.length) {
    console.log("❌ Нет услуг (Service). Создайте хотя бы одну запись.");
    return;
  }

  let planned = 0;
  for (const svc of services) {
    for (let d = 0; d < DAYS_AHEAD; d++) {
      const day = new Date();
      day.setUTCDate(day.getUTCDate() + d);

      // 0=Sun, 6=Sat — пропускаем если не включены выходные
      const dow = day.getUTCDay();
      if (!WEEKENDS && (dow === 0 || dow === 6)) continue;

      const y = day.getUTCFullYear();
      const m = day.getUTCMonth();
      const dd = day.getUTCDate();

      // Уже существующие старты этого дня (для быстрой фильтрации)
      const dayStart = new Date(Date.UTC(y, m, dd, 0, 0, 0, 0));
      const dayEnd   = new Date(Date.UTC(y, m, dd, 23, 59, 59, 999));
      const existing = await prisma.slot.findMany({
        where: { serviceId: svc.id, startAt: { gte: dayStart, lte: dayEnd } },
        select: { startAt: true },
      });
      const existSet = new Set(existing.map((e) => e.startAt.toISOString()));

      // Подготовим пачку upsert’ов по дню
      const ops = [];

      for (let h = START_HOUR; h < END_HOUR; h++) {
        const steps = Math.floor(60 / STEP_MIN);
        for (const idx of range(steps)) {
          const minute = idx * STEP_MIN;

          const startAt = new Date(Date.UTC(y, m, dd, h, minute, 0, 0));
          const endAt   = new Date(startAt.getTime() + STEP_MIN * 60 * 1000);

          // Пропускаем прошлое
          if (endAt <= now) continue;

          if (existSet.has(startAt.toISOString())) continue; // уже есть

          ops.push(
            prisma.slot.upsert({
              where: {
                // имя where для @@unique([serviceId, startAt]) генерируется Prisma:
                serviceId_startAt: { serviceId: svc.id, startAt },
              },
              create: { serviceId: svc.id, startAt, endAt, capacity: CAPACITY },
              update: {}, // ничего не меняем, если запись уже есть
            })
          );
        }
      }

      if (ops.length) {
        // Бьем на батчи по 200 операций, чтобы не упереться в лимиты
        const BATCH = 200;
        for (let i = 0; i < ops.length; i += BATCH) {
          await prisma.$transaction(ops.slice(i, i + BATCH));
        }
        planned += ops.length;
      }
    }
  }

  console.log(`✅ Готово. Создано/обновлено слотов: ~${planned}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

```
