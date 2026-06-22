# 🎨 Course Registration Frontend

React + Vite frontend for the FastAPI Course Registration demo.

## Setup

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Pages

| Page | Route | FastAPI Concepts Shown |
|------|-------|----------------------|
| **Dashboard** | `/` | `GET /analytics/summary` → async endpoints |
| **Courses** | `/courses` | Query params, pagination, enum filter, CRUD |
| **Students** | `/students` | Registration, profile lookup, file upload |
| **Enrollment** | `/enroll` | Background tasks, custom exceptions |
| **API Explorer** | `/explorer` | Live test of all endpoints |

## Notes

- Make sure the FastAPI backend is running on `http://localhost:8000` first
- Admin token for write operations: `admin-secret-123`
- Seed data is auto-loaded on backend startup
