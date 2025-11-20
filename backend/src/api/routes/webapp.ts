import { Router } from "express";
import { detectLang } from "../../i18n";
import { prisma } from "../../lib/prisma";
import { buildCalendarTemplate, CalendarTexts } from "../webapp/calendarTemplate";

const r = Router();

// Локализованные тексты для веб-календаря
const webappTexts: Record<string, CalendarTexts> = {
  ru: {
    title: "Выберите дату",
    subtitle: "Посмотрите доступные дни и подтвердите бронь",
    send: "Подтвердить дату",
    sent: "Дата отправлена. Можно закрыть окно.",
    error: "Не удалось отправить данные. Откройте календарь из Telegram.",
    monthPrev: "Назад",
    monthNext: "Вперёд",
    serviceMissing: "Не удалось определить услугу. Перезапустите из Telegram.",
    emptyState: "В этом месяце нет свободных слотов.",
    legendTitle: "Статусы дней",
    legendAvailable: "Есть места",
    legendBooked: "Все занято",
    legendDisabled: "Недоступно",
    legendHint: "Синие дни доступны для бронирования.",
    timezoneLabel: "Время указано для {timezone}",
    weekdays: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    weekStartsOn: 1
  },
  en: {
    title: "Select a date",
    subtitle: "Review available days and confirm your booking",
    send: "Confirm date",
    sent: "Date shared. You can close the window.",
    error: "Failed to send data. Please reopen from Telegram.",
    monthPrev: "Back",
    monthNext: "Next",
    serviceMissing: "Missing service information. Reopen from Telegram.",
    emptyState: "No available slots this month.",
    legendTitle: "Legend",
    legendAvailable: "Available",
    legendBooked: "Fully booked",
    legendDisabled: "Unavailable",
    legendHint: "Blue days are open for booking.",
    timezoneLabel: "Times shown in {timezone}",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    weekStartsOn: 0
  },
  he: {
    title: "בחירת תאריך",
    subtitle: "בדקו ימים פנויים ואשרו את התור",
    send: "אישור תאריך",
    sent: "התאריך נשלח. ניתן לסגור את החלון.",
    error: "לא ניתן לשלוח נתונים. פתחו מחדש מתוך הטלגרם.",
    monthPrev: "הקודם",
    monthNext: "הבא",
    serviceMissing: "חסרים נתוני שירות. פתחו מחדש מתוך טלגרם.",
    emptyState: "אין תורים פנויים בחודש זה.",
    legendTitle: "מקרא",
    legendAvailable: "פנוי",
    legendBooked: "תפוס",
    legendDisabled: "לא זמין",
    legendHint: "ימים כחולים זמינים להזמנה.",
    timezoneLabel: "השעות מוצגות באזור הזמן {timezone}",
    weekdays: ["א", "ב", "ג", "ד", "ה", "ו", "ש"],
    weekStartsOn: 0
  },
  de: {
    title: "Datum auswählen",
    subtitle: "Verfügbare Tage prüfen und Buchung bestätigen",
    send: "Datum bestätigen",
    sent: "Datum gesendet. Sie können das Fenster schließen.",
    error: "Daten konnten nicht gesendet werden. Bitte aus Telegram erneut öffnen.",
    monthPrev: "Zurück",
    monthNext: "Weiter",
    serviceMissing: "Serviceinformationen fehlen. Aus Telegram erneut öffnen.",
    emptyState: "Keine verfügbaren Termine in diesem Monat.",
    legendTitle: "Legende",
    legendAvailable: "Verfügbar",
    legendBooked: "Vollständig gebucht",
    legendDisabled: "Nicht verfügbar",
    legendHint: "Blaue Tage sind für Buchungen verfügbar.",
    timezoneLabel: "Zeiten angezeigt in {timezone}",
    weekdays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    weekStartsOn: 1
  },
  fr: {
    title: "Sélectionner une date",
    subtitle: "Consultez les jours disponibles et confirmez votre réservation",
    send: "Confirmer la date",
    sent: "Date envoyée. Vous pouvez fermer la fenêtre.",
    error: "Échec de l'envoi des données. Veuillez rouvrir depuis Telegram.",
    monthPrev: "Précédent",
    monthNext: "Suivant",
    serviceMissing: "Informations sur le service manquantes. Rouvrez depuis Telegram.",
    emptyState: "Aucun créneau disponible ce mois-ci.",
    legendTitle: "Légende",
    legendAvailable: "Disponible",
    legendBooked: "Complet",
    legendDisabled: "Indisponible",
    legendHint: "Les jours bleus sont disponibles pour réservation.",
    timezoneLabel: "Heures affichées en {timezone}",
    weekdays: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    weekStartsOn: 1
  },
  es: {
    title: "Seleccionar fecha",
    subtitle: "Revise los días disponibles y confirme su reserva",
    send: "Confirmar fecha",
    sent: "Fecha enviada. Puede cerrar la ventana.",
    error: "Error al enviar datos. Por favor, vuelva a abrir desde Telegram.",
    monthPrev: "Atrás",
    monthNext: "Siguiente",
    serviceMissing: "Faltan datos del servicio. Vuelva a abrir desde Telegram.",
    emptyState: "No hay horarios disponibles este mes.",
    legendTitle: "Leyenda",
    legendAvailable: "Disponible",
    legendBooked: "Completo",
    legendDisabled: "No disponible",
    legendHint: "Los días azules están disponibles para reservar.",
    timezoneLabel: "Horarios mostrados en {timezone}",
    weekdays: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    weekStartsOn: 1
  },
  pt: {
    title: "Selecionar data",
    subtitle: "Revise os dias disponíveis e confirme sua reserva",
    send: "Confirmar data",
    sent: "Data enviada. Você pode fechar a janela.",
    error: "Falha ao enviar dados. Por favor, abra novamente do Telegram.",
    monthPrev: "Anterior",
    monthNext: "Próximo",
    serviceMissing: "Informações do serviço ausentes. Abra novamente do Telegram.",
    emptyState: "Nenhum horário disponível neste mês.",
    legendTitle: "Legenda",
    legendAvailable: "Disponível",
    legendBooked: "Completo",
    legendDisabled: "Indisponível",
    legendHint: "Dias azuis estão disponíveis para reserva.",
    timezoneLabel: "Horários mostrados em {timezone}",
    weekdays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    weekStartsOn: 0
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
  
  // Получаем все слоты для услуги
  const allSlots = await prisma.slot.findMany({
    where: { serviceId: Number(serviceId) }
  });
  
  // Фильтруем слоты по месяцу
  const targetYear = Number(year);
  const targetMonth = Number(month);
  
  const slots = allSlots.filter(slot => {
    const slotDate = new Date(slot.startAt);
    return slotDate.getUTCFullYear() === targetYear && slotDate.getUTCMonth() === targetMonth - 1;
  });
  
  if (slots.length === 0) {
    return res.json({});
  }
  
  // Получаем все активные бронирования в организации для этого месяца
  // ВАЖНО: учитываем ВСЕ услуги, не только выбранную
  const monthStart = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));
  
  const allAppointments = await prisma.appointment.findMany({
    where: {
      service: {
        organizationId: service.organizationId
      },
      status: {
        in: ["pending", "confirmed"]
      },
      slot: {
        startAt: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    },
    include: {
      slot: true,
      service: true
    }
  });
  
  // Функция проверки пересечения временных интервалов
  // Используется та же логика, что и при создании бронирования
  function hasTimeConflict(
    slotStart: Date,
    slotEnd: Date,
    appointmentSlotStart: Date,
    appointmentServiceDuration: number
  ): boolean {
    const appointmentServiceEnd = new Date(appointmentSlotStart.getTime() + appointmentServiceDuration * 60 * 1000);
    // Пересечение: наш слот начинается до окончания существующей услуги И
    // наша услуга заканчивается после начала существующего слота
    return slotStart < appointmentServiceEnd && slotEnd > appointmentSlotStart;
  }
  
  // Группируем слоты по дням и считаем доступные
  const availability = slots.reduce((acc, slot) => {
    const slotDate = new Date(slot.startAt);
    const day = slotDate.getUTCDate();
    if (!acc[day]) {
      acc[day] = { total: 0, available: 0 };
    }
    
    // Вычисляем временной интервал слота с учетом длительности услуги
    const slotStart = new Date(slot.startAt);
    const slotEnd = new Date(slot.startAt.getTime() + service.durationMin * 60 * 1000);
    
    // Находим все бронирования, которые пересекаются с этим временным интервалом
    // Учитываем ВСЕ услуги в организации
    let occupiedCount = 0;
    for (const appointment of allAppointments) {
      const appointmentSlotStart = new Date(appointment.slot.startAt);
      if (hasTimeConflict(slotStart, slotEnd, appointmentSlotStart, appointment.service.durationMin)) {
        occupiedCount++;
      }
    }
    
    // Доступность = capacity - количество пересекающихся бронирований
    const remaining = Math.max(slot.capacity - occupiedCount, 0);
    
    acc[day].total += slot.capacity;
    acc[day].available += remaining;
    return acc;
  }, {} as Record<number, { total: number; available: number }>);
  
  res.json(availability);
});

r.get("/calendar", (req: any, res: any) => {
  const lang = detectLang(req.query.lang as string);
  const texts = webappTexts[lang] ?? webappTexts.en;
  const serviceId = typeof req.query.serviceId === "string" ? req.query.serviceId : null;
  const cutoffParam = Number(req.query.cutoffMin);
  const cutoffMin = Number.isFinite(cutoffParam) ? cutoffParam : 30;

  const html = buildCalendarTemplate({
    lang,
    texts,
    serviceId,
    cutoffMin,
    availabilityPath: "/webapp/calendar/availability"
  });

  res.type("html").send(html);
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
