import { Router } from "express";
import { detectLang } from "../../i18n";
import { prisma } from "../../lib/prisma";

const r = Router();

// Локализованные тексты для веб-календаря
const webappTexts = {
  ru: {
    title: "Выбор даты",
    placeholder: "Дата",
    send: "Отправить",
    sent: "Отправлено… можно закрыть окно.",
    error: "Не удалось отправить данные. Откройте из Telegram."
  },
  en: {
    title: "Select Date",
    placeholder: "Date",
    send: "Send",
    sent: "Sent… you can close the window.",
    error: "Failed to send data. Please open from Telegram."
  },
  he: {
    title: "בחירת תאריך",
    placeholder: "תאריך",
    send: "שליחה",
    sent: "נשלח… ניתן לסגור את החלון.",
    error: "לא ניתן לשלוח נתונים. פתחו מטלגרם."
  }
};

// API endpoint для получения доступности дней
r.get("/calendar/availability", async (req, res) => {
  const { serviceId, month, year } = req.query;
  
  if (!serviceId) {
    return res.status(400).json({ error: "serviceId is required" });
  }
  
  // CRITICAL: Verify that the service exists and get organization info
  const service = await prisma.service.findUnique({
    where: { id: Number(serviceId) },
    include: { organization: true }
  });
  
  if (!service) {
    return res.status(404).json({ error: "Service not found" });
  }
  
  // Используем более простой подход - ищем все слоты для услуги
  const allSlots = await prisma.slot.findMany({
    where: { serviceId: Number(serviceId) },
    include: { bookings: true }
  });
  
  // Фильтруем слоты по месяцу
  const targetYear = Number(year);
  const targetMonth = Number(month);
  
  const slots = allSlots.filter(slot => {
    const slotDate = new Date(slot.startAt);
    return slotDate.getUTCFullYear() === targetYear && slotDate.getUTCMonth() === targetMonth - 1;
  });
  
  // Группируем слоты по дням и считаем доступные
  const availability = slots.reduce((acc, slot) => {
    const slotDate = new Date(slot.startAt);
    const day = slotDate.getUTCDate();
    if (!acc[day]) {
      acc[day] = { total: 0, available: 0 };
    }
    acc[day].total++;
    if (slot.bookings.length < slot.capacity) {
      acc[day].available++;
    }
    return acc;
  }, {} as Record<number, { total: number; available: number }>);
  
  res.json(availability);
});

r.get("/calendar", (req, res) => {
  // Определяем язык из параметров запроса
  const lang = detectLang(req.query.lang as string);
  const texts = webappTexts[lang];
  
  res.type("html").send(`
<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${texts.title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu; margin:0; padding:16px; background:#111; color:#eee}
    h1{font-size:18px; margin:0 0 12px}
    .card{background:#1b1b1b; padding:12px; border-radius:12px}
    .btn{display:block; width:100%; margin-top:12px; padding:12px; border-radius:10px; border:none; font-size:16px; background:#4b8ef7; color:white}
    .btn[disabled]{background:#333; color:#777}
    #status{margin-top:8px; font-size:13px; color:#999}
    input{width:100%; padding:10px; border-radius:10px; border:1px solid #333; background:#0f0f0f; color:#eee}
  </style>
</head>
<body>
  <h1>${texts.title}</h1>
  <div class="card">
    <input id="date" placeholder="${texts.placeholder}" />
    <button id="send" class="btn" disabled>${texts.send}</button>
    <div id="status"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
  <script>
    // Telegram WebApp API
    const tg = window.Telegram?.WebApp;
    tg && tg.ready();
    if (tg) tg.expand();

    // Параметры (можем принять ?serviceId=1, locale=ru и т.д.)
    const params = new URLSearchParams(location.search);
    const serviceId = params.get("serviceId") || null;
    const cutoffMin = Number(params.get("cutoffMin") || "30"); // на всякий
    const today = new Date();

    // Локализованные тексты
    const texts = ${JSON.stringify(texts)};

    // Инициализация календаря
    const input = document.getElementById('date');
    const sendBtn = document.getElementById('send');
    const status = document.getElementById('status');

    // Функция для получения доступности дней
    async function getAvailability(year, month) {
      if (!serviceId) return {};
      try {
        const response = await fetch(\`/webapp/calendar/availability?serviceId=\${serviceId}&year=\${year}&month=\${month}\`);
        return await response.json();
      } catch (e) {
        console.error('Failed to fetch availability:', e);
        return {};
      }
    }

    // Инициализация календаря с динамическим отключением дней
    const fp = flatpickr(input, {
      dateFormat: "Y-m-d",
      minDate: today,
      onChange: () => { sendBtn.disabled = !input.value; },
      onMonthChange: async function(selectedDates, dateStr, instance) {
        const year = instance.currentYear;
        const month = instance.currentMonth + 1;
        const availability = await getAvailability(year, month);
        
        // Отключаем дни без свободных слотов
        const disabledDates = [];
        for (let day = 1; day <= 31; day++) {
          if (availability[day] && availability[day].available === 0) {
            const date = new Date(year, month - 1, day);
            if (date.getMonth() === month - 1) { // проверяем, что день существует в месяце
              disabledDates.push(date);
            }
          }
        }
        
        instance.set('disable', disabledDates);
      }
    });

    sendBtn.addEventListener('click', () => {
      if (!input.value) return;
      const payload = { date: input.value, serviceId, source: "calendar-webapp" };
      try {
        tg?.sendData(JSON.stringify(payload)); // улетит в бот как web_app_data
        status.textContent = texts.sent;
      } catch (e) {
        status.textContent = texts.error;
        console.error(e);
      }
    });
  </script>
</body>
</html>
  `);
});

export default r;
