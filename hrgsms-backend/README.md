# HRGSMS Backend Template (FastAPI + Raw SQL)

This is a production-ready **starter template** for the Hotel Reservation & Guest Services Management System (HRGSMS).
- Framework: **FastAPI**
- Database: **MySQL** (raw SQL, no ORM)
- Auth: **JWT** (access tokens), bcrypt password hashing
- Structure: routes → services → database (raw SQL), with Pydantic schemas

## Getting Started

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Update `.env` with your DB credentials.

## Notes
- Uses a **MySQL connection pool** (mysql-connector-python).
- All queries are **parameterized** to avoid SQL injection.
- Business logic is isolated in `app/services/*`.
- JWT role-based authorization via dependency in `app/api/dependencies.py`.
