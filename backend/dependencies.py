"""
dependencies.py — FastAPI Dependency Injection
================================================
Demonstrates:
- Simple dependencies (functions)
- Parameterized dependencies (classes with __call__)
- Chained dependencies (dependency using another dependency)
- Security-style dependencies (token guards)
- Resource-injection dependencies (DB lookups)
"""

from fastapi import Depends, Query, Header, HTTPException, status
from typing import Optional
from models import Course


# ─── Shared Query Params Dependency ───────────────────────────────────────────

class CommonQueryParams:
    """
    Reusable pagination dependency.
    Class-based dependency — FastAPI calls __init__ and injects it.
    
    Usage: commons: CommonQueryParams = Depends()
    """
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        page_size: int = Query(10, ge=1, le=100, description="Items per page")
    ):
        self.page = page
        self.page_size = page_size

# ─── Auth Dependencies ────────────────────────────────────────────────────────

ADMIN_TOKEN = "admin-secret-123"   # In production: use OAuth2/JWT

async def get_admin_token(
    x_admin_token: Optional[str] = Header(None, description="Admin token: 'admin-secret-123'")
) -> str:
    """
    Dependency that guards admin-only routes.
    Raise HTTP 403 if token missing or invalid.
    
    Demonstrates:
    - Security dependency pattern
    - Header-based auth
    """
    if not x_admin_token or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing admin token. Use header: x-admin-token: admin-secret-123"
        )
    return x_admin_token


async def get_current_student(student_id: Optional[str] = Query(None)):
    """Simple dependency to inject a student by query param."""
    from database import db
    if not student_id:
        return None
    return db.students.get(student_id)


# ─── Resource Dependency ──────────────────────────────────────────────────────

async def verify_course_exists(course_id: str) -> Course:
    """
    Path-parameter dependency that fetches & validates a course.
    Chained into route handlers to avoid repetitive DB lookup logic.
    
    Demonstrates:
    - Dependency that uses path params
    - Raising 404 inside a dependency
    """
    from database import db
    from exceptions import CourseNotFoundException
    course = db.courses.get(course_id)
    if not course:
        raise CourseNotFoundException(course_id)
    return course
