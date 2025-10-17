#!/bin/bash

# HRGSMS Simple Startup Script
# This script starts both frontend and backend services

echo "🚀 Starting HRGSMS (Hotel Room and Guest Services Management System)"
echo "=================================================="

# Function to handle cleanup on script exit
cleanup() {
    echo -e "\n🛑 Shutting down services..."
    # Kill all background jobs started by this script
    jobs -p | xargs -r kill
    exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM

# Start Backend in background
echo "📡 Starting Backend (FastAPI)..."
cd hrgsms-backend
source venv/bin/activate && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --env-file .env &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to initialize
sleep 3

# Start Frontend in background
echo "🌐 Starting Frontend (React + Vite)..."
cd hrgsms-frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started successfully!"
echo "=================================================="
echo "🌐 Frontend: http://localhost:5173"
echo "📡 Backend API: http://localhost:8000"
echo "📋 API Documentation: http://localhost:8000/docs"
echo "💾 Health Check: http://localhost:8000/health"
echo "=================================================="
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for background processes
wait