"""
Course Registration Platform - FastAPI Backend
=============================================
Demonstrates all major FastAPI concepts:
1. Path & Query Parameters
2. Request Body (Pydantic Models)
3. Response Models & Status Codes
4. Path Operations (GET, POST, PUT, DELETE, PATCH)
5. Dependency Injection
6. Background Tasks
7. Middleware (CORS, Logging)
8. Exception Handlers
9. Tags & Routers (APIRouter)
10. Lifespan Events (startup/shutdown)
11. Async Endpoints
12. File Uploads
13. Form Data
14. Cookie & Header Parameters
15. Nested Pydantic Models
16. OpenAPI / Swagger auto-docs
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Query, Path, Header, Cookie, UploadFile, File, Form, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.routing import APIRouter
import uvicorn
import asyncio
import logging
import json
from datetime import datetime
from typing import Optional, List
from models import (
    Course, CourseCreate, CourseUpdate,
    Student, StudentCreate,
    Enrollment, EnrollmentCreate,
    ApiResponse, PaginatedResponse,
    CourseCategory, EnrollmentStatus
)
from database import db
from dependencies import get_current_student, get_admin_token, verify_course_exists, CommonQueryParams
from exceptions import CourseFullException, AlreadyEnrolledException, CourseNotFoundException

# ─── Logging Setup ────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ─── Lifespan: Startup & Shutdown Events ──────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP
    logger.info("🚀 Course Registration API starting up...")
    db.seed_data()
    logger.info(f"✅ Seeded {len(db.courses)} courses and {len(db.students)} students")
    yield
    # SHUTDOWN
    logger.info("🛑 Course Registration API shutting down...")

# ─── FastAPI App Instance ──────────────────────────────────────────────────────
app = FastAPI(
    title="Course Registration Platform",
    description="""
## 📚 Course Registration Platform API

A comprehensive demo of **FastAPI** concepts including:

- **Path & Query Parameters**
- **Pydantic v2 Models** (request/response validation)
- **Dependency Injection**
- **Background Tasks**
- **Custom Middleware**
- **Custom Exception Handlers**
- **APIRouter** (modular routing)
- **Async/Await** endpoints
- **File Uploads**
- **Lifespan Events**
- **OpenAPI** auto-documentation
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# ─── CORS Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Custom Middleware: Request Logger ─────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Custom middleware to log every incoming request."""
    start_time = datetime.now()
    logger.info(f"→ {request.method} {request.url.path}")
    response = await call_next(request)
    duration = (datetime.now() - start_time).total_seconds() * 1000
    logger.info(f"← {response.status_code} [{duration:.1f}ms]")
    return response

# ─── Custom Exception Handlers ────────────────────────────────────────────────
@app.exception_handler(CourseFullException)
async def course_full_handler(request: Request, exc: CourseFullException):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": str(exc), "error_code": "COURSE_FULL"}
    )

@app.exception_handler(AlreadyEnrolledException)
async def already_enrolled_handler(request: Request, exc: AlreadyEnrolledException):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": str(exc), "error_code": "ALREADY_ENROLLED"}
    )

@app.exception_handler(CourseNotFoundException)
async def course_not_found_handler(request: Request, exc: CourseNotFoundException):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc), "error_code": "COURSE_NOT_FOUND"}
    )

# ─── Background Task: Email Notification ──────────────────────────────────────
def send_enrollment_email(student_name: str, course_title: str):
    """Background task simulating email sending (non-blocking)."""
    logger.info(f"📧 [BG TASK] Sending enrollment confirmation to {student_name} for '{course_title}'")
    # Simulate email delay
    import time; time.sleep(1)
    logger.info(f"✉️ [BG TASK] Email sent to {student_name}!")

# ══════════════════════════════════════════════════════════════════════════════
# ROUTER: Courses
# ══════════════════════════════════════════════════════════════════════════════
courses_router = APIRouter(prefix="/courses", tags=["Courses 📚"])

@courses_router.get("/", response_model=PaginatedResponse[Course], summary="List all courses")
async def list_courses(
    commons: CommonQueryParams = Depends(),
    category: Optional[CourseCategory] = Query(None, description="Filter by category"),
    min_credits: int = Query(0, ge=0, le=10, description="Minimum credit hours"),
    search: Optional[str] = Query(None, description="Search by title or description"),
):
    """
    Retrieve a paginated list of courses.

    Demonstrates:
    - **Query Parameters** with validation (`ge`, `le`)
    - **Optional parameters** with defaults
    - **Enum filtering** via `CourseCategory`
    - **Dependency Injection** via `CommonQueryParams`
    """
    courses = list(db.courses.values())

    if category:
        courses = [c for c in courses if c.category == category]
    if min_credits:
        courses = [c for c in courses if c.credits >= min_credits]
    if search:
        q = search.lower()
        courses = [c for c in courses if q in c.title.lower() or q in c.description.lower()]

    total = len(courses)
    start = (commons.page - 1) * commons.page_size
    end = start + commons.page_size
    paginated = courses[start:end]

    return PaginatedResponse(
        data=paginated,
        total=total,
        page=commons.page,
        page_size=commons.page_size,
        total_pages=(total + commons.page_size - 1) // commons.page_size
    )

@courses_router.get("/{course_id}", response_model=Course, summary="Get a single course")
async def get_course(
    course_id: str = Path(..., description="The unique course ID", example="CS101"),
    include_students: bool = Query(False, description="Include enrolled student list"),
):
    """
    Get details for a specific course by ID.

    Demonstrates:
    - **Path Parameters** with validation & examples
    - **Optional query flags**
    - Custom exception raising
    """
    course = db.courses.get(course_id)
    if not course:
        raise CourseNotFoundException(course_id)
    return course

@courses_router.post("/", response_model=Course, status_code=status.HTTP_201_CREATED, summary="Create a course")
async def create_course(
    course_data: CourseCreate,
    admin: str = Depends(get_admin_token),
):
    """
    Create a new course (admin only).

    Demonstrates:
    - **Request Body** with Pydantic model
    - **201 Created** status code
    - **Dependency Injection** for auth guard
    """
    import uuid
    course_id = course_data.title.replace(" ", "").upper()[:6] + str(len(db.courses) + 1)
    course = Course(
        id=course_id,
        **course_data.model_dump(),
        enrolled_count=0,
        created_at=datetime.now()
    )
    db.courses[course_id] = course
    logger.info(f"📗 Course created: {course_id}")
    return course

@courses_router.put("/{course_id}", response_model=Course, summary="Full update a course")
async def update_course(
    course_id: str,
    course_data: CourseCreate,
    admin: str = Depends(get_admin_token),
    course: Course = Depends(verify_course_exists),
):
    """
    Fully replace a course's data (PUT).

    Demonstrates:
    - **Multiple Dependencies** chained
    - **PUT** (full replacement) semantics
    """
    updated = Course(
        id=course_id,
        **course_data.model_dump(),
        enrolled_count=course.enrolled_count,
        created_at=course.created_at
    )
    db.courses[course_id] = updated
    return updated

@courses_router.patch("/{course_id}", response_model=Course, summary="Partial update a course")
async def patch_course(
    course_id: str,
    course_data: CourseUpdate,
    admin: str = Depends(get_admin_token),
    course: Course = Depends(verify_course_exists),
):
    """
    Partially update a course (PATCH).

    Demonstrates:
    - **PATCH** semantics (only provided fields updated)
    - `model_dump(exclude_unset=True)` pattern
    """
    update_data = course_data.model_dump(exclude_unset=True)
    updated_course = course.model_copy(update=update_data)
    db.courses[course_id] = updated_course
    return updated_course

@courses_router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a course")
async def delete_course(
    course_id: str,
    admin: str = Depends(get_admin_token),
    course: Course = Depends(verify_course_exists),
):
    """
    Delete a course.

    Demonstrates:
    - **204 No Content** response
    - Cascading logic (remove enrollments)
    """
    del db.courses[course_id]
    # Cascade delete enrollments
    db.enrollments = {k: v for k, v in db.enrollments.items() if v.course_id != course_id}
    logger.info(f"🗑️ Course deleted: {course_id}")

# ══════════════════════════════════════════════════════════════════════════════
# ROUTER: Students
# ══════════════════════════════════════════════════════════════════════════════
students_router = APIRouter(prefix="/students", tags=["Students 🎓"])

@students_router.post("/register", response_model=Student, status_code=status.HTTP_201_CREATED, summary="Register a new student")
async def register_student(student_data: StudentCreate):
    """
    Register a new student.

    Demonstrates:
    - Pydantic **validation** (email, name length)
    - Auto-generated IDs
    """
    if any(s.email == student_data.email for s in db.students.values()):
        raise HTTPException(status_code=400, detail="Email already registered")

    student_id = f"STU{len(db.students) + 1:04d}"
    student = Student(
        id=student_id,
        **student_data.model_dump(),
        created_at=datetime.now()
    )
    db.students[student_id] = student
    return student

@students_router.get("/{student_id}", response_model=Student, summary="Get student profile")
async def get_student(
    student_id: str,
    x_auth_token: Optional[str] = Header(None, description="Auth token in header"),
    session_token: Optional[str] = Cookie(None, description="Session token from cookie"),
):
    """
    Get a student's profile.

    Demonstrates:
    - **Header Parameters** (`x_auth_token`)
    - **Cookie Parameters** (`session_token`)
    """
    student = db.students.get(student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")
    return student

@students_router.get("/{student_id}/enrollments", response_model=List[Enrollment], summary="Get student's enrollments")
async def get_student_enrollments(student_id: str):
    """Get all courses a student is enrolled in."""
    if student_id not in db.students:
        raise HTTPException(status_code=404, detail="Student not found")
    return [e for e in db.enrollments.values() if e.student_id == student_id]

@students_router.post("/{student_id}/avatar", summary="Upload student avatar")
async def upload_avatar(
    student_id: str,
    file: UploadFile = File(..., description="Profile picture (JPG/PNG)"),
):
    """
    Upload a student's profile picture.

    Demonstrates:
    - **File Upload** with `UploadFile`
    - File metadata access
    """
    if student_id not in db.students:
        raise HTTPException(status_code=404, detail="Student not found")

    content = await file.read()
    size_kb = len(content) / 1024

    if size_kb > 500:
        raise HTTPException(status_code=413, detail="File too large (max 500KB)")

    logger.info(f"📷 Avatar uploaded for {student_id}: {file.filename} ({size_kb:.1f}KB)")

    return ApiResponse(
        success=True,
        message=f"Avatar '{file.filename}' uploaded successfully",
        data={"filename": file.filename, "size_kb": round(size_kb, 2), "content_type": file.content_type}
    )

# ══════════════════════════════════════════════════════════════════════════════
# ROUTER: Enrollments
# ══════════════════════════════════════════════════════════════════════════════
enrollments_router = APIRouter(prefix="/enrollments", tags=["Enrollments ✅"])

@enrollments_router.post("/", response_model=Enrollment, status_code=status.HTTP_201_CREATED, summary="Enroll in a course")
async def enroll_in_course(
    enrollment_data: EnrollmentCreate,
    background_tasks: BackgroundTasks,
):
    """
    Enroll a student into a course.

    Demonstrates:
    - **Background Tasks** for async email sending
    - **Custom exception handling**
    - Business logic with validation
    """
    student = db.students.get(enrollment_data.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    course = db.courses.get(enrollment_data.course_id)
    if not course:
        raise CourseNotFoundException(enrollment_data.course_id)

    # Check duplicate enrollment
    already = any(
        e.student_id == enrollment_data.student_id and e.course_id == enrollment_data.course_id
        for e in db.enrollments.values()
    )
    if already:
        raise AlreadyEnrolledException(enrollment_data.student_id, enrollment_data.course_id)

    # Check capacity
    if course.enrolled_count >= course.max_students:
        raise CourseFullException(enrollment_data.course_id, course.max_students)

    # Create enrollment
    enrollment_id = f"ENR{len(db.enrollments) + 1:04d}"
    enrollment = Enrollment(
        id=enrollment_id,
        student_id=enrollment_data.student_id,
        course_id=enrollment_data.course_id,
        status=EnrollmentStatus.ACTIVE,
        enrolled_at=datetime.now()
    )
    db.enrollments[enrollment_id] = enrollment

    # Update course count
    db.courses[enrollment_data.course_id] = course.model_copy(update={"enrolled_count": course.enrolled_count + 1})

    # 🔥 Background Task: send email without blocking response
    background_tasks.add_task(send_enrollment_email, student.name, course.title)

    return enrollment

@enrollments_router.delete("/{enrollment_id}", status_code=status.HTTP_200_OK, summary="Drop a course")
async def drop_course(enrollment_id: str):
    """
    Drop (unenroll) from a course.

    Demonstrates:
    - Cascade update (decrement course count)
    """
    enrollment = db.enrollments.get(enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    course = db.courses.get(enrollment.course_id)
    if course:
        db.courses[enrollment.course_id] = course.model_copy(
            update={"enrolled_count": max(0, course.enrolled_count - 1)}
        )

    del db.enrollments[enrollment_id]
    return ApiResponse(success=True, message="Successfully dropped the course")

@enrollments_router.get("/", response_model=List[Enrollment], summary="List all enrollments")
async def list_all_enrollments(
    status_filter: Optional[EnrollmentStatus] = Query(None, alias="status"),
    admin: str = Depends(get_admin_token),
):
    """List all enrollments (admin only, with optional status filter)."""
    enrollments = list(db.enrollments.values())
    if status_filter:
        enrollments = [e for e in enrollments if e.status == status_filter]
    return enrollments

# ══════════════════════════════════════════════════════════════════════════════
# ROUTER: Analytics (Async demo)
# ══════════════════════════════════════════════════════════════════════════════
analytics_router = APIRouter(prefix="/analytics", tags=["Analytics 📊"])

@analytics_router.get("/summary", summary="Platform-wide statistics")
async def get_summary():
    """
    Async endpoint computing platform stats.

    Demonstrates:
    - **async/await** with `asyncio.gather`
    - Concurrent computation
    """
    async def count_courses(): 
        await asyncio.sleep(0)  # Simulated async I/O
        return len(db.courses)
    
    async def count_students():
        await asyncio.sleep(0)
        return len(db.students)
    
    async def count_enrollments():
        await asyncio.sleep(0)
        return len(db.enrollments)

    total_courses, total_students, total_enrollments = await asyncio.gather(
        count_courses(), count_students(), count_enrollments()
    )

    # Category breakdown
    category_counts = {}
    for course in db.courses.values():
        cat = course.category.value
        category_counts[cat] = category_counts.get(cat, 0) + 1

    return {
        "total_courses": total_courses,
        "total_students": total_students,
        "total_enrollments": total_enrollments,
        "courses_by_category": category_counts,
        "avg_enrollment_rate": round(
            sum(c.enrolled_count / max(c.max_students, 1) for c in db.courses.values()) / max(total_courses, 1) * 100, 1
        )
    }

# ══════════════════════════════════════════════════════════════════════════════
# ROOT & HEALTH
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/", tags=["Root 🏠"], summary="Welcome endpoint")
async def root():
    """Root endpoint returning API info."""
    return {
        "name": "Course Registration Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "concepts": [
            "Path & Query Parameters",
            "Pydantic v2 Models",
            "Dependency Injection",
            "Background Tasks",
            "Custom Middleware",
            "Exception Handlers",
            "APIRouter (modular routing)",
            "Lifespan Events",
            "Async/Await Endpoints",
            "File Uploads",
            "Header & Cookie Params",
            "Response Models & Status Codes"
        ]
    }

@app.get("/health", tags=["Root 🏠"], summary="Health check")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# ─── Register Routers ──────────────────────────────────────────────────────────
app.include_router(courses_router)
app.include_router(students_router)
app.include_router(enrollments_router)
app.include_router(analytics_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
