#!/bin/bash

echo "🚀 Setup Hotel Booking API - Day 2"
echo "=================================="
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found!"
    echo "   Please install from: https://nodejs.org"
    exit 1
fi

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm found: v$NPM_VERSION"
else
    echo "❌ npm not found!"
    exit 1
fi

echo ""
echo "📥 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔧 Creating .env file (if not exists)..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env file created from .env.example"
else
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "🧪 Testing server..."
node -e "console.log('✅ Node.js can execute scripts')"

echo ""
echo "=================================="
echo "✅ Setup complete!"
echo ""
echo "To start the server:"
echo "  npm start     (production mode)"
echo "  npm run dev   (development mode with auto-reload)"
echo ""
echo "Server will run at: http://localhost:3000"
echo "=================================="
