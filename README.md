# 📚 Course Registration Platform — FastAPI Demo

A full-stack application demonstrating **22 FastAPI concepts** with a React frontend.

## 🗂️ Project Structure

```
course-registration/
├── backend/           # FastAPI application
│   ├── main.py        # App factory, middleware, routers, exception handlers
│   ├── models.py      # Pydantic v2 models (request/response/nested/generic)
│   ├── database.py    # In-memory store with seed data
│   ├── dependencies.py # Dependency injection patterns
│   ├── exceptions.py  # Custom exception classes
│   └── requirements.txt
│
└── frontend/          # React + Vite
    ├── src/
    │   ├── pages/     # Dashboard, Courses, Students, Enroll, ApiExplorer
    │   ├── api/       # Axios client with all endpoint calls
    │   └── App.jsx    # Router + sidebar
    └── package.json
```

## 🚀 Quick Start

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Open
- **Frontend**: http://localhost:5173
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔑 Auth
Admin-only endpoints require: `x-admin-token: admin-secret-123`

## 📚 FastAPI Concepts Covered

1. **Path Parameters** — `GET /courses/{course_id}`
2. **Query Parameters** — pagination, search, enum filter
3. **Request Body** — Pydantic models on POST/PUT
4. **Response Models** — typed `response_model=Course`
5. **HTTP Status Codes** — 201, 204, 404, 409
6. **Dependency Injection** — `Depends()` with classes and functions
7. **Background Tasks** — `BackgroundTasks` for email simulation
8. **Custom Middleware** — request logger
9. **CORS Middleware** — `CORSMiddleware`
10. **Custom Exception Handlers** — `@app.exception_handler`
11. **APIRouter** — modular routing with prefixes and tags
12. **Lifespan Events** — `@asynccontextmanager` startup/shutdown
13. **Async Endpoints** — `asyncio.gather` for concurrent ops
14. **File Uploads** — `UploadFile` + `File(...)`
15. **Header Parameters** — `Header(...)`
16. **Cookie Parameters** — `Cookie(...)`
17. **Pydantic field_validator** — custom field-level validation
18. **Pydantic model_validator** — cross-field validation
19. **Generic Models** — `PaginatedResponse[T]`
20. **Nested Models** — `Instructor` inside `Course`
21. **PATCH semantics** — `exclude_unset=True` for partial updates
22. **OpenAPI Docs** — auto-generated Swagger + ReDoc
