# HRGSMS - Hotel Room and Guest Services Management System

A full-stack hotel management system with React frontend and FastAPI backend.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Python FastAPI + MySQL
- **Authentication**: JWT tokens
- **API Documentation**: Swagger/OpenAPI

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- MySQL Server
- Git

### Option 1: Start Everything at Once
```bash
# From the project root
./start-all.sh
```

### Option 2: Start Services Individually

#### Backend (FastAPI)
```bash
cd hrgsms-backend
./start.sh
```

#### Frontend (React)
```bash
cd hrgsms-frontend
./start.sh
```

## 🔗 Service URLs

Once both services are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## ⚙️ Configuration

### Backend Configuration
Configuration is handled through environment variables in `hrgsms-backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hrgsms_db

# JWT
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXP_MINUTES=1440

# Application
APP_ENV=development
API_HOST=127.0.0.1
API_PORT=8000

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration
Configuration is handled through environment variables in `hrgsms-frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=HRGSMS - Hotel Management System
```

## 🔧 Manual Setup

### Backend Setup
```bash
cd hrgsms-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup
```bash
cd hrgsms-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup
1. Ensure MySQL is running
2. Create the database:
   ```sql
   CREATE DATABASE hrgsms_db;
   ```
3. Run the database schema and seed files from `hrgsms-db/` directory

## 🔍 API Testing

### Using the API Documentation
Visit http://localhost:8000/docs to access the interactive Swagger documentation.

### Health Check
```bash
curl http://localhost:8000/health
```

### Authentication
The API uses JWT tokens. Most endpoints require authentication via the `Authorization: Bearer <token>` header.

## 🛠️ Development

### Backend Development
- API routes are in `hrgsms-backend/app/api/routes/`
- Database models in `hrgsms-backend/app/models/`
- Business logic in `hrgsms-backend/app/services/`

### Frontend Development
- React components in `hrgsms-frontend/src/components/`
- Feature modules in `hrgsms-frontend/src/features/`
- API client in `hrgsms-frontend/src/api/client.ts`

## 🚨 Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure:
1. Backend CORS is configured for your frontend URL
2. Frontend is calling the correct backend URL
3. Both services are running on expected ports

### Port Conflicts
- Backend runs on port 8000
- Frontend runs on port 5173
- Change ports in respective configuration files if needed

### Database Connection
Check the database connection settings in `hrgsms-backend/.env` and ensure MySQL is running.

## 📝 Additional Notes

- The frontend automatically handles JWT token storage and API authentication
- Backend includes automatic API documentation generation
- CORS is pre-configured for development
- Both services support hot-reload during development