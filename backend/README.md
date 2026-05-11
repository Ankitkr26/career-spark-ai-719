# PlaceIQ Backend

This backend is a Django REST Framework API that stores application data in MongoDB.
It provides authentication endpoints, resume management, and job management.

## Features
- User registration and login with hashed passwords in MongoDB
- Token-based authentication using MongoDB token storage
- Resume CRUD APIs for authenticated users
- Job CRUD APIs with admin-only create/update/delete
- CORS support for a frontend running on `http://localhost:5173`

## Local setup
1. Install Python dependencies:
   ```powershell
   cd backend
   .\venv\Scripts\python.exe -m pip install -r requirements.txt
   ```

2. Start MongoDB locally or configure `MONGO_URI` and `MONGO_DB_NAME` in environment variables.

3. Run migrations for Django built-in apps:
   ```powershell
   .\venv\Scripts\python.exe manage.py migrate
   ```

4. Run the development server:
   ```powershell
   D:\career\career-spark-ai-719\backend\venv\Scripts\python.exe manage.py runserver 8000
   ```

## API endpoints
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `GET /api/resumes/`
- `POST /api/resumes/`
- `GET /api/resumes/{id}/`
- `PATCH /api/resumes/{id}/`
- `DELETE /api/resumes/{id}/`
- `GET /api/jobs/`
- `POST /api/jobs/` (admin only)
- `GET /api/jobs/{id}/`
- `PATCH /api/jobs/{id}/` (admin only)
- `DELETE /api/jobs/{id}/` (admin only)

## Notes
- The frontend communicates with this Django backend for auth and data management at `http://127.0.0.1:8000/api/`.
