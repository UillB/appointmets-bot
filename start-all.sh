#!/bin/bash

# 🚀 Скрипт для запуска всех сервисов Appointments Bot
# Использование: ./start-all.sh

set -e

echo "🚀 Запуск всех сервисов Appointments Bot..."
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка что мы в правильной директории
if [ ! -d "backend" ] || [ ! -d "admin-panel-react" ] || [ ! -d "landing" ]; then
    echo "❌ Ошибка: Запустите скрипт из корня проекта appointments-bot"
    exit 1
fi

# Функция для проверки порта
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  Порт $1 уже занят${NC}"
        return 1
    fi
    return 0
}

# Шаг 1: База данных
echo "📊 Шаг 1: Настройка базы данных..."
cd backend
npx prisma db push --skip-generate > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ База данных готова${NC}"
else
    echo "❌ Ошибка настройки базы данных"
    exit 1
fi
cd ..

# Шаг 2: Backend
echo ""
echo "🔧 Шаг 2: Запуск Backend (порт 4000)..."
if check_port 4000; then
    cd backend
    echo "   Запускаю backend в фоне..."
    npm run dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../.backend.pid
    echo -e "${GREEN}✅ Backend запущен (PID: $BACKEND_PID)${NC}"
    echo "   Логи: logs/backend.log"
    sleep 3
    cd ..
else
    echo -e "${YELLOW}⚠️  Backend уже запущен или порт 4000 занят${NC}"
fi

# Шаг 3: React Admin Panel
echo ""
echo "⚛️  Шаг 3: Запуск React Admin Panel (порт 4200)..."
if check_port 4200; then
    cd admin-panel-react
    echo "   Запускаю React панель в фоне..."
    npm run dev > ../logs/react-admin.log 2>&1 &
    REACT_PID=$!
    echo $REACT_PID > ../.react.pid
    echo -e "${GREEN}✅ React панель запущена (PID: $REACT_PID)${NC}"
    echo "   Логи: logs/react-admin.log"
    sleep 3
    cd ..
else
    echo -e "${YELLOW}⚠️  React панель уже запущена или порт 4200 занят${NC}"
fi

# Шаг 4: Landing Page
echo ""
echo "🌐 Шаг 4: Запуск Landing Page (порт 3000)..."
if check_port 3000; then
    cd landing
    echo "   Запускаю Landing в фоне..."
    npm run dev > ../logs/landing.log 2>&1 &
    LANDING_PID=$!
    echo $LANDING_PID > ../.landing.pid
    echo -e "${GREEN}✅ Landing запущен (PID: $LANDING_PID)${NC}"
    echo "   Логи: logs/landing.log"
    sleep 3
    cd ..
else
    echo -e "${YELLOW}⚠️  Landing уже запущен или порт 3000 занят${NC}"
fi

# Шаг 5: Сборка React для WebApp
echo ""
echo "📦 Шаг 5: Сборка React панели для Telegram WebApp..."
cd admin-panel-react
if [ ! -d "build" ]; then
    echo "   Собираю React панель..."
    npm run build > ../logs/react-build.log 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ React панель собрана${NC}"
    else
        echo "⚠️  Ошибка сборки (проверьте logs/react-build.log)"
    fi
else
    echo -e "${YELLOW}⚠️  Build уже существует, пропускаю сборку${NC}"
fi
cd ..

# Шаг 6: Ngrok для HTTPS (Telegram WebApp требует HTTPS)
echo ""
echo "🌐 Шаг 6: Запуск Ngrok туннеля для HTTPS (порт 4000)..."
if check_port 4040; then
    # Проверяем наличие ngrok
    if ! command -v ngrok &> /dev/null; then
        echo -e "${YELLOW}⚠️  Ngrok не установлен. Установите: brew install ngrok/ngrok/ngrok${NC}"
        echo -e "${YELLOW}⚠️  Или пропустите этот шаг и запустите вручную: ngrok http 4000${NC}"
    else
        mkdir -p logs
        echo "   Запускаю ngrok туннель для backend (порт 4000)..."
        ngrok http 4000 --log=stdout > logs/ngrok.log 2>&1 &
        NGROK_PID=$!
        echo $NGROK_PID > .ngrok.pid
        sleep 3
        # Получаем ngrok URL
        NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
        if [ -n "$NGROK_URL" ]; then
            echo -e "${GREEN}✅ Ngrok запущен (PID: $NGROK_PID)${NC}"
            echo "   HTTPS URL: $NGROK_URL"
            echo "   Логи: logs/ngrok.log"
            echo ""
            echo "   ⚠️  ВАЖНО: Обновите backend/.env с PUBLIC_BASE_URL=$NGROK_URL"
            echo "   Команда: echo 'PUBLIC_BASE_URL=$NGROK_URL' >> backend/.env"
            echo "   Затем перезапустите backend!"
        else
            echo -e "${YELLOW}⚠️  Ngrok запущен, но URL еще не доступен. Проверьте через несколько секунд:${NC}"
            echo "   curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.proto==\"https\") | .public_url'"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Ngrok уже запущен или порт 4040 занят${NC}"
fi

# Финальная проверка
echo ""
echo "🔍 Проверка сервисов..."
sleep 2

echo ""
echo "📋 Статус сервисов:"
echo ""

# Backend
if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend: http://localhost:4000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend: не отвечает${NC}"
fi

# React
if curl -s http://localhost:4200 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ React Admin: http://localhost:4200${NC}"
else
    echo -e "${YELLOW}⚠️  React Admin: не отвечает${NC}"
fi

# Landing
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Landing: http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Landing: не отвечает${NC}"
fi

echo ""
echo "🎉 Готово!"
echo ""
echo "📝 Полезные команды:"
echo "   Остановить все: ./stop-all.sh"
echo "   Просмотр логов: tail -f logs/*.log"
echo ""
echo "🌐 URL:"
echo "   Backend API: http://localhost:4000"
echo "   React Admin: http://localhost:4200"
echo "   Landing: http://localhost:3000"
echo "   Telegram WebApp: http://localhost:4000/webapp/admin"
if [ -n "$NGROK_URL" ]; then
    echo "   Ngrok HTTPS: $NGROK_URL"
    echo ""
    echo "⚠️  ВАЖНО для Telegram WebApp:"
    echo "   1. Обновите backend/.env: echo 'PUBLIC_BASE_URL=$NGROK_URL' >> backend/.env"
    echo "   2. Перезапустите backend: lsof -ti:4000 | xargs kill -9 && cd backend && npm run dev"
fi
echo ""

