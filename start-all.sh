#!/bin/bash

# 🚀 Скрипт для запуска всех сервисов Appointments Bot
# Использование: ./start-all.sh

set -e

# Load nvm and use Node 20
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20 > /dev/null 2>&1 || true

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

# Шаг 2: Ngrok для HTTPS (должен быть запущен ПЕРЕД backend)
echo ""
echo "🌐 Шаг 2: Настройка Ngrok для HTTPS (Telegram WebApp требует HTTPS)..."
NGROK_URL=""
if check_port 4040; then
    if ! command -v ngrok &> /dev/null; then
        echo -e "${YELLOW}⚠️  Ngrok не установлен. Установите: brew install ngrok/ngrok/ngrok${NC}"
    else
        # Проверяем аутентификацию ngrok
        if ! ngrok config check &> /dev/null; then
            echo -e "${YELLOW}⚠️  Ngrok не аутентифицирован${NC}"
            echo "   Для Telegram WebApp требуется HTTPS. Настройте ngrok:"
            echo "   1. Зарегистрируйтесь: https://dashboard.ngrok.com/signup"
            echo "   2. Получите authtoken: https://dashboard.ngrok.com/get-started/your-authtoken"
            echo "   3. Выполните: ngrok config add-authtoken YOUR_AUTHTOKEN"
        else
            mkdir -p logs
            echo "   Запускаю ngrok туннель для backend (порт 4000)..."
            ngrok http 4000 --log=stdout > logs/ngrok.log 2>&1 &
            NGROK_PID=$!
            echo $NGROK_PID > .ngrok.pid
            sleep 5
            # Получаем ngrok URL
            for i in {1..10}; do
                NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
                if [ -n "$NGROK_URL" ]; then
                    break
                fi
                sleep 2
            done
            if [ -n "$NGROK_URL" ]; then
                echo -e "${GREEN}✅ Ngrok запущен (PID: $NGROK_PID)${NC}"
                echo "   HTTPS URL: $NGROK_URL"
                # Автоматически обновляем backend/.env
                cd backend
                if grep -q "^PUBLIC_BASE_URL=" .env 2>/dev/null; then
                    sed -i '' '/^PUBLIC_BASE_URL=/d' .env
                fi
                echo "PUBLIC_BASE_URL=$NGROK_URL" >> .env
                cd ..
                echo -e "${GREEN}✅ Обновлен backend/.env с HTTPS URL${NC}"
            else
                echo -e "${YELLOW}⚠️  Ngrok запущен, но URL еще не доступен${NC}"
            fi
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Ngrok уже запущен или порт 4040 занят${NC}"
    # Пытаемся получить существующий URL
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
    if [ -n "$NGROK_URL" ]; then
        echo "   Используется существующий туннель: $NGROK_URL"
        # Обновляем .env если нужно
        cd backend
        if ! grep -q "^PUBLIC_BASE_URL=$NGROK_URL" .env 2>/dev/null; then
            if grep -q "^PUBLIC_BASE_URL=" .env 2>/dev/null; then
                sed -i '' '/^PUBLIC_BASE_URL=/d' .env
            fi
            echo "PUBLIC_BASE_URL=$NGROK_URL" >> .env
            echo -e "${GREEN}✅ Обновлен backend/.env с HTTPS URL${NC}"
        fi
        cd ..
    fi
fi

# Шаг 3: Backend
echo ""
echo "🔧 Шаг 3: Запуск Backend (порт 4000)..."
if check_port 4000; then
    cd backend
    echo "   Запускаю backend в фоне..."
    bash -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 20 && npm run dev' > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../.backend.pid
    echo -e "${GREEN}✅ Backend запущен (PID: $BACKEND_PID)${NC}"
    echo "   Логи: logs/backend.log"
    sleep 3
    cd ..
else
    echo -e "${YELLOW}⚠️  Backend уже запущен или порт 4000 занят${NC}"
fi

# Шаг 4: React Admin Panel
echo ""
echo "⚛️  Шаг 4: Запуск React Admin Panel (порт 4200)..."
if check_port 4200; then
    cd admin-panel-react
    echo "   Запускаю React панель в фоне..."
    bash -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 20 && npm run dev' > ../logs/react-admin.log 2>&1 &
    REACT_PID=$!
    echo $REACT_PID > ../.react.pid
    echo -e "${GREEN}✅ React панель запущена (PID: $REACT_PID)${NC}"
    echo "   Логи: logs/react-admin.log"
    sleep 3
    cd ..
else
    echo -e "${YELLOW}⚠️  React панель уже запущена или порт 4200 занят${NC}"
fi

# Шаг 5: Landing Page
echo ""
echo "🌐 Шаг 5: Запуск Landing Page (порт 3000)..."
if check_port 3000; then
    cd landing
    echo "   Запускаю Landing в фоне..."
    bash -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 20 && npm run dev' > ../logs/landing.log 2>&1 &
    LANDING_PID=$!
    echo $LANDING_PID > ../.landing.pid
    echo -e "${GREEN}✅ Landing запущен (PID: $LANDING_PID)${NC}"
    echo "   Логи: logs/landing.log"
    sleep 3
    cd ..
else
    echo -e "${YELLOW}⚠️  Landing уже запущен или порт 3000 занят${NC}"
fi

# Шаг 6: Сборка React для WebApp
echo ""
echo "📦 Шаг 6: Сборка React панели для Telegram WebApp..."
cd admin-panel-react
if [ ! -d "build" ]; then
    echo "   Собираю React панель..."
    bash -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 20 && npm run build' > ../logs/react-build.log 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ React панель собрана${NC}"
    else
        echo "⚠️  Ошибка сборки (проверьте logs/react-build.log)"
    fi
else
    echo -e "${YELLOW}⚠️  Build уже существует, пропускаю сборку${NC}"
fi
cd ..

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
if [ -n "$NGROK_URL" ]; then
    echo "   Ngrok HTTPS: $NGROK_URL"
    echo "   Telegram WebApp: $NGROK_URL/webapp/calendar"
    echo ""
    echo -e "${GREEN}✅ Backend настроен для работы с Telegram WebApp (HTTPS)${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Ngrok не настроен - Telegram WebApp может не работать${NC}"
    echo "   Telegram требует HTTPS для Web App кнопок"
fi
echo ""

