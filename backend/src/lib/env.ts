import * as dotenv from 'dotenv';
dotenv.config();

function req(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env ${key}`);
  return v;
}

// sanitize
const RAW_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim(); // убираем пробелы/переносы
if (RAW_TOKEN && !/^\d{7,}:[A-Za-z0-9_-]{20,}$/.test(RAW_TOKEN)) {
  throw new Error('TELEGRAM_BOT_TOKEN looks invalid (pattern mismatch)');
}

export const ENV = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  TELEGRAM_BOT_TOKEN: RAW_TOKEN || '',
  BOT_MODE: process.env.BOT_MODE || 'polling',
  PUBLIC_BASE_URL: (process.env.PUBLIC_BASE_URL || 'http://localhost:4000').trim(),
  ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID?.trim(),
  ADMIN_GROUP_ID: process.env.ADMIN_GROUP_ID?.trim(),
  BOOKING_CUTOFF_MIN: Number(process.env.BOOKING_CUTOFF_MIN ?? 30), // ← добавили
};

