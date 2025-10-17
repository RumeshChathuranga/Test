#!/bin/bash

# HRGSMS Master Startup Script
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

# Start Backend
echo "📡 Starting Backend (FastAPI)..."
cd hrgsms-backend
gnome-terminal -- bash -c "./start.sh; exec bash" &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to initialize
sleep 3

# Start Frontend
echo "🌐 Starting Frontend (React + Vite)..."
cd hrgsms-frontend
gnome-terminal -- bash -c "./start.sh; exec bash" &
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

# Wait for background processes
wait