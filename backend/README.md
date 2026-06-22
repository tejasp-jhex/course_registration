# 🚀 FastAPI Backend — Course Registration Platform

## Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 📖 API Docs
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔑 Admin Token
For admin-only routes (POST/PUT/DELETE courses, list enrollments), include this header:
```
x-admin-token: admin-secret-123
```

## 📚 FastAPI Concepts Demonstrated

| # | Concept | Where |
|---|---------|-------|
| 1 | **Path Parameters** | `GET /courses/{course_id}` |
| 2 | **Query Parameters** | `GET /courses/?category=&search=&page=` |
| 3 | **Request Body (Pydantic)** | `POST /courses/`, `POST /students/register` |
| 4 | **Response Models** | `response_model=Course`, `PaginatedResponse[Course]` |
| 5 | **HTTP Status Codes** | `201 Created`, `204 No Content`, `409 Conflict` |
| 6 | **Dependency Injection** | `CommonQueryParams`, `get_admin_token`, `verify_course_exists` |
| 7 | **Background Tasks** | Enrollment email in `POST /enrollments/` |
| 8 | **Custom Middleware** | Request logger (`log_requests`) |
| 9 | **CORS Middleware** | `CORSMiddleware` in `main.py` |
| 10 | **Exception Handlers** | `CourseFullException`, `AlreadyEnrolledException` |
| 11 | **APIRouter** | `courses_router`, `students_router`, `enrollments_router` |
| 12 | **Lifespan Events** | `@asynccontextmanager async def lifespan(app)` |
| 13 | **Async Endpoints** | `asyncio.gather` in `/analytics/summary` |
| 14 | **File Uploads** | `POST /students/{id}/avatar` |
| 15 | **Header Parameters** | `x_auth_token` in `GET /students/{id}` |
| 16 | **Cookie Parameters** | `session_token` in `GET /students/{id}` |
| 17 | **Pydantic Validators** | `@field_validator`, `@model_validator` |
| 18 | **Generic Models** | `PaginatedResponse[T]` |
| 19 | **Nested Models** | `Instructor` inside `Course` |
| 20 | **Enums** | `CourseCategory`, `EnrollmentStatus` |
| 21 | **PATCH (partial update)** | `PATCH /courses/{id}` with `exclude_unset=True` |
| 22 | **OpenAPI Docs** | Auto-generated at `/docs` |
