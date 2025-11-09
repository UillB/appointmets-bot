# ⚡ Быстрая справка для команды

> Краткая шпаргалка для ежедневной работы

## 🚀 Быстрый старт дня

```bash
# 1. Обновить код
git checkout develop
git pull origin develop

# 2. Создать/переключиться на feature ветку
git checkout -b feature/my-task

# 3. Начать работу
```

## 📝 Коммиты

```bash
# Формат: type(scope): subject
git commit -m "feat(backend): add user authentication"
git commit -m "fix(frontend): resolve calendar bug"
git commit -m "docs(readme): update installation"
```

**Типы:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

## 🔀 Типичный workflow

```bash
# 1. Начать задачу
git checkout develop && git pull
git checkout -b feature/my-feature

# 2. Работа
# ... делаем изменения ...

# 3. Коммит
git add .
git commit -m "feat(scope): description"

# 4. Пуш
git push origin feature/my-feature

# 5. Создать PR через GitHub UI
```

## 🔄 Синхронизация

```bash
# Обновить develop
git checkout develop
git pull origin develop

# Обновить feature ветку
git checkout feature/my-feature
git rebase develop  # или git merge develop
```

## 🎯 Разделение работы

### Backend Developer:
- `backend/src/api/`
- `backend/src/bot/`
- `backend/src/websocket/`
- `backend/prisma/`

### Frontend Developer:
- `admin-panel-react/src/`
- `landing/`
- UI компоненты

## ⚠️ Важно

- ❌ НЕ коммить в `main` напрямую
- ❌ НЕ коммить `.env` файлы
- ✅ ВСЕГДА создавай feature ветки
- ✅ ВСЕГДА делай code review
- ✅ Обновляйся с develop регулярно

## 🆘 Решение конфликтов

```bash
# Если конфликт при merge
git merge develop
# Разрешить конфликты в Cursor
git add .
git commit -m "merge: resolve conflicts"
```

## 📞 Коммуникация

- **Issues** - для задач
- **PR комментарии** - для code review
- **Telegram** - для быстрой синхронизации

---

**Полная документация:** `docs/TEAM_WORKFLOW.md`

