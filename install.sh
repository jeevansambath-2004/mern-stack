#!/bin/bash

echo "🚀 Setting up MERN Stack Todo Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ All dependencies installed successfully!"

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if command -v mongod &> /dev/null; then
    echo "ℹ️  MongoDB is available. Make sure it's running with 'mongod'"
else
    echo "⚠️  MongoDB not found. Please install MongoDB or use MongoDB Atlas"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Make sure MongoDB is running"
echo "2. Run: npm run dev"
echo ""
echo "This will start:"
echo "   - Backend server on http://localhost:5000"
echo "   - Frontend app on http://localhost:3000"
echo ""
echo "Happy coding! 🚀" 