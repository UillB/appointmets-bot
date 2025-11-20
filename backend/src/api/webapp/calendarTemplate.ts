export interface CalendarTexts {
  title: string;
  subtitle: string;
  send: string;
  sent: string;
  error: string;
  monthPrev: string;
  monthNext: string;
  serviceMissing: string;
  emptyState: string;
  legendTitle: string;
  legendAvailable: string;
  legendBooked: string;
  legendDisabled: string;
  legendHint: string;
  timezoneLabel: string;
  weekdays: string[];
  weekStartsOn: number;
}

interface CalendarTemplateOptions {
  lang: string;
  texts: CalendarTexts;
  serviceId: string | null;
  cutoffMin: number;
  availabilityPath: string;
}

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export function buildCalendarTemplate(options: CalendarTemplateOptions): string {
  const { lang, texts, serviceId, cutoffMin, availabilityPath } = options;
  const config = {
    lang,
    serviceId,
    cutoffMin,
    availabilityPath,
    texts
  };

  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${texts.title}</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
      :root {
        color-scheme: light dark;
        font-family: ${FONT_STACK};
        --bg-color: #0f1116;
        --card-bg: #161b22;
        --card-border: rgba(255, 255, 255, 0.08);
        --text-primary: #f4f5f7;
        --text-secondary: #8b95a7;
        --accent: #4b8ef7;
        --accent-hover: #6ea3ff;
        --accent-muted: rgba(75, 142, 247, 0.15);
        --danger: #ff6b6b;
        --disabled: rgba(255, 255, 255, 0.15);
        --grid-line: rgba(255, 255, 255, 0.08);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 16px;
        background: var(--bg-color);
        color: var(--text-primary);
        font-family: ${FONT_STACK};
        min-height: 100vh;
      }

      .layout {
        max-width: 480px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      header {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      header h1 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
      }

      header p {
        margin: 0;
        font-size: 0.95rem;
        color: var(--text-secondary);
      }

      .card {
        background: var(--card-bg);
        border-radius: 16px;
        border: 1px solid var(--card-border);
        padding: 16px;
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
      }

      .calendar-shell {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .calendar-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .month-label {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .month-label span {
        font-weight: 600;
        font-size: 1rem;
      }

      .nav-buttons {
        display: flex;
        gap: 8px;
      }

      button {
        font-family: inherit;
      }

      .nav-button {
        border: 1px solid var(--card-border);
        background: transparent;
        color: var(--text-primary);
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        transition: border-color 0.2s ease, background 0.2s ease;
      }

      .nav-button:hover {
        border-color: var(--accent);
        background: var(--accent-muted);
      }

      .nav-button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
        border-color: var(--card-border);
        background: transparent;
      }

      .weekdays,
      .grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 6px;
      }

      .grid {
        min-height: 280px;
        transition: opacity 0.2s ease;
      }

      .grid[data-loading="true"] {
        opacity: 0.35;
        pointer-events: none;
      }

      .weekdays span {
        text-align: center;
        font-size: 0.75rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .day {
        position: relative;
        aspect-ratio: 1 / 1;
        border-radius: 14px;
        border: 1px solid var(--grid-line);
        padding: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: border-color 0.2s ease, transform 0.15s ease, background 0.2s ease;
      }

      .day span {
        font-size: 1rem;
      }

      .day small {
        font-size: 0.65rem;
        color: var(--text-secondary);
        font-weight: 600;
        letter-spacing: 0.04em;
      }

      .day[data-status="available"] {
        border-color: rgba(75, 142, 247, 0.35);
        background: rgba(75, 142, 247, 0.08);
      }

      .day[data-status="booked"] {
        border-color: rgba(255, 107, 107, 0.4);
        background: rgba(255, 107, 107, 0.08);
        color: var(--danger);
      }

      .day[data-status="disabled"] {
        border-style: dashed;
        cursor: not-allowed;
        opacity: 0.35;
      }

      .day[data-selected="true"] {
        background: var(--accent);
        color: #fff;
        border-color: transparent;
        box-shadow: 0 10px 20px rgba(24, 119, 242, 0.35);
      }

      .day:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }

      .legend {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 4px;
      }

      .legend-title {
        font-size: 0.85rem;
        color: var(--text-secondary);
        font-weight: 600;
      }

      .legend-hint {
        font-size: 0.78rem;
        color: var(--text-secondary);
      }

      .legend-items {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 6px;
      }

      .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 10px;
        border-radius: 999px;
        border: 1px solid var(--card-border);
      }

      .legend-dot {
        width: 14px;
        height: 14px;
        border-radius: 999px;
      }

      .legend-dot.available {
        background: var(--accent);
      }

      .legend-dot.booked {
        background: var(--danger);
      }

      .legend-dot.disabled {
        background: var(--disabled);
      }

      .timezone {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-top: 4px;
      }

      .actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .primary-btn {
        width: 100%;
        padding: 14px;
        border-radius: 12px;
        border: 1px solid var(--card-border);
        font-size: 1rem;
        font-weight: 600;
        background: var(--card-bg);
        color: var(--text-secondary);
        cursor: not-allowed;
        opacity: 0.5;
        transition: all 0.2s ease;
      }

      .primary-btn[data-enabled="true"] {
        cursor: pointer;
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
        opacity: 1;
        box-shadow: 0 4px 12px rgba(75, 142, 247, 0.3);
      }

      .primary-btn[data-enabled="true"]:hover {
        background: var(--accent-hover);
        box-shadow: 0 6px 16px rgba(75, 142, 247, 0.4);
        transform: translateY(-1px);
      }

      .primary-btn[data-enabled="true"]:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(75, 142, 247, 0.3);
      }

      .toast {
        position: fixed;
        left: 16px;
        right: 16px;
        bottom: 16px;
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.75);
        color: #fff;
        font-size: 0.9rem;
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.2s ease, transform 0.2s ease;
        pointer-events: none;
      }

      .toast[data-visible="true"] {
        opacity: 1;
        transform: translateY(0);
      }

      .empty-state {
        text-align: center;
        padding: 24px 12px;
        font-size: 0.95rem;
        color: var(--text-secondary);
      }

      @media (min-width: 480px) {
        body {
          padding: 32px;
        }
      }
    </style>
  </head>
  <body>
    <div class="layout">
      <header>
        <h1>${texts.title}</h1>
        <p>${texts.subtitle}</p>
      </header>

      <section class="card calendar-shell">
        <div class="calendar-header">
          <div class="month-label">
            <span data-month-label></span>
          </div>
          <div class="nav-buttons">
            <button class="nav-button" type="button" data-nav="prev">${texts.monthPrev}</button>
            <button class="nav-button" type="button" data-nav="next">${texts.monthNext}</button>
          </div>
        </div>

        <div class="weekdays" data-weekdays></div>
        <div class="grid" data-calendar-grid></div>
        <div class="empty-state" data-empty hidden>${texts.emptyState}</div>
        <span class="timezone" data-timezone></span>
      </section>

      <section class="card actions">
        <button class="primary-btn" type="button" data-action="confirm" data-enabled="false" disabled>${texts.send}</button>
      </section>
    </div>

    <div class="toast" data-toast></div>

    <script>
      (function() {
        const config = ${JSON.stringify(config)};
        const tg = window.Telegram && window.Telegram.WebApp;
        tg && tg.ready();
        tg && tg.expand();

        const state = {
          today: new Date(),
          currentMonth: null,
          selectedDate: null,
          cache: new Map()
        };

        function pad(value) {
          return String(value).padStart(2, '0');
        }

        function formatDateKey(date) {
          return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
        }

        const elements = {
          grid: document.querySelector('[data-calendar-grid]'),
          monthLabel: document.querySelector('[data-month-label]'),
          confirmBtn: document.querySelector('[data-action="confirm"]'),
          empty: document.querySelector('[data-empty]'),
          toast: document.querySelector('[data-toast]'),
          timezone: document.querySelector('[data-timezone]'),
          weekdaysRow: document.querySelector('[data-weekdays]'),
          navButtons: document.querySelectorAll('[data-nav]')
        };

        const MINUTE_MS = 60 * 1000;
        const minDate = new Date(state.today.getTime() + config.cutoffMin * MINUTE_MS);
        const minSelectableDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());

        function syncTheme() {
          const params = (tg && tg.themeParams) || {};
          const root = document.documentElement;
          const map = [
            { param: 'bg_color', varName: '--bg-color' },
            { param: 'secondary_bg_color', varName: '--card-bg' },
            { param: 'text_color', varName: '--text-primary' },
            { param: 'hint_color', varName: '--text-secondary' }
          ];

          map.forEach(({ param, varName }) => {
            if (params[param]) {
              root.style.setProperty(varName, '#' + params[param]);
            }
          });

          if (params.button_color) {
            root.style.setProperty('--accent', '#' + params.button_color);
          }
          if (params.button_text_color) {
            root.style.setProperty('--accent-hover', '#' + params.button_text_color);
          }
        }

        syncTheme();
        tg && tg.onEvent && tg.onEvent('themeChanged', syncTheme);

        function formatMonth(date) {
          return date.toLocaleDateString(config.lang, { month: 'long', year: 'numeric' });
        }

        function getMonthKey(year, month) {
          return year + '-' + (month + 1);
        }

        function showToast(message) {
          elements.toast.textContent = message;
          elements.toast.setAttribute('data-visible', 'true');
          setTimeout(() => elements.toast.removeAttribute('data-visible'), 2800);
        }

        function setLoading(isLoading) {
          if (elements.grid) {
            elements.grid.dataset.loading = isLoading ? 'true' : 'false';
          }
        }

        function populateWeekdays() {
          const weekdays = config.texts.weekdays;
          const weekStartsOn = config.texts.weekStartsOn;
          const ordered = weekdays.slice(weekStartsOn).concat(weekdays.slice(0, weekStartsOn));
          elements.weekdaysRow.innerHTML = ordered.map((day) => '<span>' + day + '</span>').join('');
        }

        function updateTimezoneLabel() {
          try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            elements.timezone.textContent = config.texts.timezoneLabel.replace('{timezone}', tz);
          } catch (e) {
            elements.timezone.textContent = '';
          }
        }

        populateWeekdays();
        updateTimezoneLabel();

        elements.navButtons.forEach((btn) => {
          btn.addEventListener('click', () => {
            if (!state.currentMonth) return;
            const direction = btn.dataset.nav === 'next' ? 1 : -1;
            const newDate = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + direction, 1);
            state.currentMonth = newDate;
            loadMonth(newDate);
          });
        });

        function setConfirmEnabled(enabled) {
          if (!elements.confirmBtn) return;
          elements.confirmBtn.dataset.enabled = enabled ? 'true' : 'false';
          elements.confirmBtn.disabled = !enabled;
          elements.confirmBtn.setAttribute('aria-disabled', (!enabled).toString());
        }

        if (elements.confirmBtn) {
          elements.confirmBtn.addEventListener('click', () => {
          if (!state.selectedDate || !config.serviceId) {
            showToast(config.texts.serviceMissing);
            return;
          }

          const payload = {
            date: state.selectedDate,
            serviceId: config.serviceId,
            source: 'calendar-webapp'
          };

            try {
              tg && tg.sendData(JSON.stringify(payload));
              showToast(config.texts.sent);
            } catch (error) {
              console.error(error);
              showToast(config.texts.error);
            }
          });
        }

        function renderDays(year, month, availability) {
          const weekStartsOn = config.texts.weekStartsOn;
          const firstDay = new Date(year, month, 1);
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const startOffset = (firstDay.getDay() - weekStartsOn + 7) % 7;
          const fragments = [];

          elements.monthLabel.textContent = formatMonth(firstDay);
          elements.empty.hidden = true;

          for (let i = 0; i < startOffset; i++) {
            fragments.push('<div></div>');
          }

          let availableCount = 0;
          for (let day = 1; day <= daysInMonth; day++) {
            const displayDate = new Date(year, month, day);
            const iso = formatDateKey(displayDate);
            const slot = availability[String(day)];
            const isPast = displayDate < minSelectableDate;
            let status = 'disabled';

            if (slot && slot.available > 0) {
              status = 'available';
              availableCount++;
            } else if (slot && slot.available === 0) {
              status = 'booked';
            }

            if (isPast) {
              status = 'disabled';
            }

            const selected = state.selectedDate === iso;

            fragments.push(\`<button class="day" type="button" data-status="\${status}" data-iso="\${iso}" data-selected="\${selected}" \${status === 'available' ? '' : 'disabled'}><span>\${day}</span><small>\${slot ? slot.available + '/' + slot.total : '--'}</small></button>\`);
          }

          elements.grid.innerHTML = fragments.join('');
          elements.empty.hidden = availableCount !== 0;

          elements.grid.querySelectorAll('.day').forEach((button) => {
            button.addEventListener('click', () => {
              const iso = button.dataset.iso;
              state.selectedDate = iso;
              elements.grid
                .querySelectorAll('.day')
                .forEach((node) => node.setAttribute('data-selected', node.dataset.iso === iso ? 'true' : 'false'));
              setConfirmEnabled(true);
            });
          });

          const persistedSelection = state.selectedDate
            ? elements.grid.querySelector('.day[data-iso="' + state.selectedDate + '"]')
            : null;
          const selectionValid = !!persistedSelection && persistedSelection.getAttribute('data-status') === 'available';

          if (!selectionValid) {
            state.selectedDate = null;
            setConfirmEnabled(false);
          } else {
            setConfirmEnabled(true);
          }
        }

        async function fetchAvailability(year, month) {
          const key = getMonthKey(year, month);
          if (state.cache.has(key)) {
            return state.cache.get(key);
          }

          if (!config.serviceId) {
            return {};
          }

          try {
            setLoading(true);
            const url = \`\${config.availabilityPath}?serviceId=\${config.serviceId}&year=\${year}&month=\${month + 1}\`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to load availability');
            const data = await response.json();
            state.cache.set(key, data);
            return data;
          } catch (error) {
            console.error(error);
            showToast(config.texts.error);
            return null;
          } finally {
            setLoading(false);
          }
        }

        async function loadMonth(date) {
          const year = date.getFullYear();
          const month = date.getMonth();
          const availability = await fetchAvailability(year, month);
          if (!availability) {
            return;
          }
          renderDays(year, month, availability);
        }

        function init() {
          setConfirmEnabled(false);
          const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
          state.currentMonth = current;
          loadMonth(current);
        }

        init();
      })();
    </script>
  </body>
</html>
`;
}

