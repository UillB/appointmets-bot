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
r.get("/calendar/availability", async (req: any, res: any) => {
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

r.get("/calendar", (req: any, res: any) => {
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

// Admin WebApp wrapper: initializes Telegram WebApp, authenticates, and redirects to React app
r.get("/admin", (req: any, res: any) => {
  const lang = detectLang(req.query.lang as string);
  // IMPORTANT: Use same-origin path for Telegram iOS webview to avoid cross-origin redirects
  // Use trailing slash to ensure proper routing
  const frontendUrl = "/admin-panel/";

  res.type("html").send(`
<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Admin Panel</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    body { margin:0; padding:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu; background: var(--tg-theme-bg-color, #ffffff); color: var(--tg-theme-text-color, #000000); }
    #loading { display:flex; align-items:center; justify-content:center; height:100vh; flex-direction:column; gap:16px; }
    .spinner { width:40px; height:40px; border:4px solid rgba(0,0,0,0.1); border-top:4px solid #3b82f6; border-radius:50%; animation:spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
    #status { margin-top: 16px; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div id="loading">
    <div class="spinner"></div>
    <p>Loading Admin Panel…</p>
    <div id="status"></div>
  </div>
  <script>
    (function(){
      console.log('🔍 Wrapper script started');
      var statusEl = document.getElementById('status');
      
      function setStatus(msg) {
        if (statusEl) statusEl.textContent = msg;
        console.log('📝 Status:', msg);
      }
      
      // Wait for Telegram WebApp script to load
      function authenticateAndRedirect() {
        try {
          var tg = window.Telegram && window.Telegram.WebApp;
          
          if (!tg) {
            setStatus('⚠️ Telegram WebApp not available');
            setTimeout(function() {
              window.location.replace('${frontendUrl}');
            }, 1000);
            return;
          }
          
          tg.ready();
          tg.expand();
          
          var initData = tg.initData;
          var telegramUser = tg.initDataUnsafe?.user;
          
          console.log('🔍 Telegram WebApp data:', {
            hasInitData: !!initData,
            hasUser: !!telegramUser,
            userId: telegramUser?.id
          });
          
          if (!initData || !telegramUser) {
            setStatus('⚠️ Telegram data incomplete');
            setTimeout(function() {
              window.location.replace('${frontendUrl}');
            }, 1000);
            return;
          }
          
          setStatus('🔐 Authenticating...');
          console.log('🔐 Attempting authentication with Telegram ID:', telegramUser.id);
          
          // CRITICAL: Authenticate directly in wrapper page
          fetch('/api/auth/telegram-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              telegramId: telegramUser.id.toString(),
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name,
              username: telegramUser.username,
              languageCode: telegramUser.language_code,
              initData: initData
            })
          })
          .then(function(response) {
            console.log('📥 Auth response status:', response.status);
            if (!response.ok) {
              return response.json().then(function(data) {
                console.error('❌ Auth failed:', data);
                throw new Error(data.error || 'Authentication failed');
              });
            }
            return response.json();
          })
          .then(function(data) {
            console.log('✅ Authentication successful:', {
              userId: data.user.id,
              email: data.user.email
            });
            
            // Save tokens to localStorage
            try {
              localStorage.setItem('accessToken', data.accessToken);
              localStorage.setItem('refreshToken', data.refreshToken);
              localStorage.setItem('user', JSON.stringify(data.user));
              console.log('✅ Tokens saved to localStorage');
            } catch (e) {
              console.error('❌ Failed to save tokens:', e);
            }
            
            setStatus('✅ Authenticated! Loading...');
            
            // Redirect to React app
            setTimeout(function() {
              window.location.replace('${frontendUrl}');
            }, 500);
          })
          .catch(function(error) {
            console.error('❌ Authentication error:', error);
            setStatus('❌ Auth failed: ' + error.message);
            // Still redirect - user will see login page
            setTimeout(function() {
              window.location.replace('${frontendUrl}');
            }, 2000);
          });
        } catch (e) {
          console.error('❌ Error:', e);
          setStatus('❌ Error: ' + e.message);
          setTimeout(function() {
            window.location.replace('${frontendUrl}');
          }, 2000);
        }
      }
      
      // Wait for Telegram script to load
      if (typeof window.Telegram === 'undefined') {
        setStatus('⏳ Waiting for Telegram...');
        var checkInterval = setInterval(function() {
          if (typeof window.Telegram !== 'undefined') {
            clearInterval(checkInterval);
            setStatus('✅ Telegram loaded');
            setTimeout(authenticateAndRedirect, 200);
          }
        }, 100);
        
        setTimeout(function() {
          clearInterval(checkInterval);
          if (typeof window.Telegram === 'undefined') {
            setStatus('⚠️ Telegram timeout - redirecting...');
            window.location.replace('${frontendUrl}');
          }
        }, 3000);
      } else {
        authenticateAndRedirect();
      }
    })();
  </script>
</body>
</html>
  `);
});

export default r;
