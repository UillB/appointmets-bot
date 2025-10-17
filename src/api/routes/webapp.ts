import { Router } from "express";
const r = Router();

r.get("/calendar", (_, res) => {
  res.type("html").send(`
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Выбор даты</title>
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
  <h1>Выберите дату</h1>
  <div class="card">
    <input id="date" placeholder="Дата" />
    <button id="send" class="btn" disabled>Отправить</button>
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

    // Инициализация календаря
    const input = document.getElementById('date');
    const sendBtn = document.getElementById('send');
    const status = document.getElementById('status');

    const fp = flatpickr(input, {
      dateFormat: "Y-m-d",
      minDate: today,          // не даём выбрать прошлое
      // здесь можно добавить disable для выходных: disable: [date => [0,6].includes(date.getDay())]
      onChange: () => { sendBtn.disabled = !input.value; }
    });

    sendBtn.addEventListener('click', () => {
      if (!input.value) return;
      const payload = { date: input.value, serviceId, source: "calendar-webapp" };
      try {
        tg?.sendData(JSON.stringify(payload)); // улетит в бот как web_app_data
        status.textContent = "Отправлено… можно закрыть окно.";
      } catch (e) {
        status.textContent = "Не удалось отправить данные. Откройте из Telegram.";
        console.error(e);
      }
    });
  </script>
</body>
</html>
  `);
});

export default r;
