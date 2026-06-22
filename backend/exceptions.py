"""
exceptions.py — Custom Exception Classes
==========================================
Demonstrates:
- Custom exception classes
- Registered with @app.exception_handler in main.py
- Clean error codes for frontend consumption
"""


class CourseNotFoundException(Exception):
    def __init__(self, course_id: str):
        self.course_id = course_id
        super().__init__(f"Course '{course_id}' not found.")


class CourseFullException(Exception):
    def __init__(self, course_id: str, max_students: int):
        self.course_id = course_id
        super().__init__(f"Course '{course_id}' is full (max {max_students} students).")


class AlreadyEnrolledException(Exception):
    def __init__(self, student_id: str, course_id: str):
        super().__init__(f"Student '{student_id}' is already enrolled in '{course_id}'.")
