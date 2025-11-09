# 🚀 Настройка для совместной работы

> Первоначальная настройка проекта для команды из 2 разработчиков

## 📋 Чеклист настройки

### 1. Git конфигурация

```bash
# Настроить имя и email (если еще не настроено)
git config --global user.name "Ваше Имя"
git config --global user.email "your.email@example.com"

# Настроить commit template (уже настроен в проекте)
git config --local commit.template .gitmessage

# Настроить default branch
git config --local init.defaultBranch main
```

### 2. Создание веток

```bash
# Убедиться что есть develop ветка
git checkout -b develop
git push -u origin develop

# Вернуться в main
git checkout main
```

### 3. Настройка Cursor

1. **Открыть проект в Cursor**
2. **Проверить что `.cursorrules` загружен** (должен быть в корне проекта)
3. **Настроить Git в Cursor:**
   - Settings → Git
   - Включить "Auto Fetch"
   - Включить "Confirm Sync"

### 4. Настройка окружения

```bash
# Создать .env файлы (если еще нет)
cd backend
cp .env.example .env  # и заполнить значениями

cd ../admin-panel-react
# Создать .env если нужно

cd ../landing
# Создать .env если нужно
```

### 5. Установка зависимостей

```bash
# Backend
cd backend
npm install

# Frontend (Admin Panel)
cd ../admin-panel-react
npm install

# Landing
cd ../landing
npm install
```

### 6. Инициализация базы данных

```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed  # если нужно
```

### 7. Проверка что все работает

```bash
# Backend
cd backend
npm run dev  # должен запуститься на порту 4000

# Frontend (в другом терминале)
cd admin-panel-react
npm run dev  # должен запуститься на порту 4200

# Landing (в другом терминале)
cd landing
npm run dev  # должен запуститься на порту 3000
```

## 🔐 Настройка защиты веток (опционально)

Если используете GitHub/GitLab, можно настроить branch protection:

### GitHub:
1. Settings → Branches
2. Add rule для `main`
3. Включить:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

### GitLab:
1. Settings → Repository → Protected branches
2. Защитить `main`
3. Включить:
   - Allowed to merge: Maintainers
   - Allowed to push: No one

## 📞 Настройка коммуникации

### Рекомендуемые инструменты:

1. **GitHub/GitLab Issues** - для задач
2. **Telegram/Discord** - для быстрой синхронизации
3. **Pull Request комментарии** - для code review

### Создать каналы:

- `#general` - общие обсуждения
- `#backend` - обсуждения backend
- `#frontend` - обсуждения frontend
- `#code-review` - уведомления о PR

## ✅ Финальная проверка

- [ ] Git настроен
- [ ] Ветки созданы (main, develop)
- [ ] Cursor настроен
- [ ] Зависимости установлены
- [ ] База данных инициализирована
- [ ] Все сервисы запускаются
- [ ] Коммуникация настроена
- [ ] Оба разработчика имеют доступ к репозиторию

## 🎯 Первые шаги

1. **Ознакомиться с документацией:**
   - Прочитать `docs/TEAM_WORKFLOW.md`
   - Прочитать `docs/TEAM_QUICK_REFERENCE.md`

2. **Создать первую feature ветку:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/setup-team-workflow
   ```

3. **Сделать первый коммит:**
   ```bash
   git add .
   git commit -m "docs: add team workflow documentation"
   git push origin feature/setup-team-workflow
   ```

4. **Создать первый PR:**
   - Через GitHub/GitLab UI
   - Использовать шаблон Pull Request
   - Попросить партнера сделать review

---

**Готово!** Теперь можно начинать работу. 🚀

