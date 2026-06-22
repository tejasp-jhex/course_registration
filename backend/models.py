"""
models.py — Pydantic v2 Models
=================================
Demonstrates:
- BaseModel with field validation
- Field(...) with constraints and metadata
- Optional fields with defaults
- Nested models
- Enum types
- Generic models (PaginatedResponse[T])
- Response-only models vs Create/Update models
"""

from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
from typing import Optional, List, TypeVar, Generic
from datetime import datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class CourseCategory(str, Enum):
    """String enum — values serialize to their string value in JSON."""
    CS = "Computer Science"
    MATH = "Mathematics"
    PHYSICS = "Physics"
    DATA = "Data Science"
    WEB = "Web Development"
    AI = "Artificial Intelligence"
    CLOUD = "Cloud Computing"
    DEVOPS = "DevOps"

class EnrollmentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"

# ─── Nested Model Example ─────────────────────────────────────────────────────

class Instructor(BaseModel):
    """Nested model embedded inside Course."""
    name: str = Field(..., min_length=2, max_length=100, example="Dr. Jane Smith")
    email: EmailStr = Field(..., example="jane.smith@university.edu")
    department: str = Field(..., example="Computer Science")

# ─── Course Models ────────────────────────────────────────────────────────────

class CourseBase(BaseModel):
    """Shared fields — base class for DRY model design."""
    title: str = Field(..., min_length=3, max_length=100, example="Intro to Python")
    description: str = Field(..., min_length=10, example="Learn Python from scratch.")
    category: CourseCategory
    credits: int = Field(..., ge=1, le=10, description="Credit hours (1–10)")
    max_students: int = Field(..., ge=1, le=500, description="Max enrollment capacity")
    instructor: Instructor
    is_active: bool = Field(True, description="Whether course is open for enrollment")

class CourseCreate(CourseBase):
    """Model for POST /courses — used as request body."""

    @field_validator("title")
    @classmethod
    def title_must_not_be_generic(cls, v: str) -> str:
        """Custom field-level validator."""
        forbidden = ["test", "sample", "demo", "temp"]
        if any(word in v.lower() for word in forbidden):
            raise ValueError(f"Title cannot contain generic words: {forbidden}")
        return v.strip()

class CourseUpdate(BaseModel):
    """
    PATCH model — all fields optional.
    Using `model_dump(exclude_unset=True)` on this allows true partial updates.
    """
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    category: Optional[CourseCategory] = None
    credits: Optional[int] = Field(None, ge=1, le=10)
    max_students: Optional[int] = Field(None, ge=1, le=500)
    instructor: Optional[Instructor] = None
    is_active: Optional[bool] = None

class Course(CourseBase):
    """Full Course — returned in responses. Includes server-set fields."""
    id: str
    enrolled_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}

# ─── Student Models ───────────────────────────────────────────────────────────

class StudentCreate(BaseModel):
    """Request body for student registration."""
    name: str = Field(..., min_length=2, max_length=100, example="Tejas Pokale")
    email: EmailStr = Field(..., example="tejas@example.com")
    phone: Optional[str] = Field(None, pattern=r"^\+?[0-9]{7,15}$", example="+917890123456")
    bio: Optional[str] = Field(None, max_length=500)

    @model_validator(mode="after")
    def sanitize_fields(self) -> "StudentCreate":
        """Model-level validator: strip whitespace from name."""
        self.name = self.name.strip()
        return self

class Student(StudentCreate):
    """Full student object returned in responses."""
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}

# ─── Enrollment Models ────────────────────────────────────────────────────────

class EnrollmentCreate(BaseModel):
    """Request body to enroll a student in a course."""
    student_id: str = Field(..., example="STU0001")
    course_id: str = Field(..., example="CS101")

class Enrollment(BaseModel):
    """Full enrollment object."""
    id: str
    student_id: str
    course_id: str
    status: EnrollmentStatus
    enrolled_at: datetime

    model_config = {"from_attributes": True}

# ─── Generic Response Wrappers ────────────────────────────────────────────────

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic paginated response — works with any data type.
    e.g. PaginatedResponse[Course], PaginatedResponse[Student]
    """
    data: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int

class ApiResponse(BaseModel):
    """Standard success/error envelope."""
    success: bool
    message: str
    data: Optional[dict] = None
