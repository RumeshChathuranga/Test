#!/bin/bash

# HRGSMS Backend Startup Script

echo "Starting HRGSMS Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment (cross-platform)
echo "Activating virtual environment..."
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
elif [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
else
    echo "Could not find the virtual environment activation script."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the application
echo "Starting FastAPI server..."
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --env-file .env