#!/bin/bash

# Appointments Bot Setup Script
# This script sets up the development environment for the appointments-bot project

set -e

echo "🚀 Setting up Appointments Bot Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20 or later is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../admin-panel
npm install
echo "✅ Frontend dependencies installed"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd ../backend
npx prisma generate
echo "✅ Prisma client generated"

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy
echo "✅ Database migrations completed"

# Seed the database
echo "🌱 Seeding database..."
npm run seed
echo "✅ Database seeded"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "⚠️ .env.example not found, please create .env manually"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure your .env file in the backend directory"
echo "2. Start the backend: cd backend && npm run dev"
echo "3. Start the frontend: cd admin-panel && npm run dev"
echo ""
echo "Backend will be available at: http://localhost:4000"
echo "Frontend will be available at: http://localhost:4200"
echo ""
