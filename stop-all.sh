#!/bin/bash

# 🛑 Скрипт для остановки всех сервисов Appointments Bot
# Использование: ./stop-all.sh

echo "🛑 Остановка всех сервисов..."

# Остановка по PID файлам
if [ -f .backend.pid ]; then
    PID=$(cat .backend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ Backend остановлен (PID: $PID)"
    fi
    rm .backend.pid
fi

if [ -f .react.pid ]; then
    PID=$(cat .react.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ React панель остановлена (PID: $PID)"
    fi
    rm .react.pid
fi

if [ -f .landing.pid ]; then
    PID=$(cat .landing.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ Landing остановлен (PID: $PID)"
    fi
    rm .landing.pid
fi

if [ -f .ngrok.pid ]; then
    PID=$(cat .ngrok.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ Ngrok остановлен (PID: $PID)"
    fi
    rm .ngrok.pid
fi

# Дополнительная очистка процессов
pkill -f "tsx watch.*server.ts" 2>/dev/null && echo "✅ Остаточные backend процессы остановлены"
pkill -f "vite.*4200" 2>/dev/null && echo "✅ Остаточные React процессы остановлены"
pkill -f "next dev.*3000" 2>/dev/null && echo "✅ Остаточные Landing процессы остановлены"
pkill -f "ngrok" 2>/dev/null && echo "✅ Остаточные Ngrok процессы остановлены"

echo ""
echo "🎉 Все сервисы остановлены!"

