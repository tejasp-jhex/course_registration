"""
database.py — In-Memory Database
===================================
Simulates a database with dicts.
In production, swap this for SQLAlchemy + async DB drivers.
"""

from models import Course, Student, Enrollment, Instructor, CourseCategory, EnrollmentStatus
from datetime import datetime
from typing import Dict


class InMemoryDatabase:
    def __init__(self):
        self.courses: Dict[str, Course] = {}
        self.students: Dict[str, Student] = {}
        self.enrollments: Dict[str, Enrollment] = {}

    def seed_data(self):
        """Populate initial data on startup."""
        sample_courses = [
            Course(
                id="CS101",
                title="Introduction to Python",
                description="Learn Python fundamentals: syntax, data structures, OOP, and file I/O. Perfect for beginners entering the world of programming.",
                category=CourseCategory.CS,
                credits=3,
                max_students=40,
                instructor=Instructor(name="Dr. Priya Sharma", email="priya.sharma@univ.edu", department="Computer Science"),
                enrolled_count=12,
                is_active=True,
                created_at=datetime(2024, 1, 10)
            ),
            Course(
                id="DS201",
                title="Data Engineering with Spark",
                description="Deep dive into Apache Spark, PySpark, distributed data processing, and building production-grade ELT pipelines.",
                category=CourseCategory.DATA,
                credits=4,
                max_students=30,
                instructor=Instructor(name="Prof. Rahul Mehta", email="rahul.mehta@univ.edu", department="Data Science"),
                enrolled_count=28,
                is_active=True,
                created_at=datetime(2024, 2, 5)
            ),
            Course(
                id="AI301",
                title="Machine Learning Fundamentals",
                description="Supervised, unsupervised, and reinforcement learning. Covers scikit-learn, model evaluation, and real-world ML projects.",
                category=CourseCategory.AI,
                credits=4,
                max_students=35,
                instructor=Instructor(name="Dr. Ananya Iyer", email="ananya.iyer@univ.edu", department="Artificial Intelligence"),
                enrolled_count=35,
                is_active=True,
                created_at=datetime(2024, 1, 20)
            ),
            Course(
                id="WEB101",
                title="Full-Stack Web Development",
                description="Build modern web apps using React, Node.js, Express, and MongoDB. Deploy on AWS with CI/CD pipelines.",
                category=CourseCategory.WEB,
                credits=3,
                max_students=50,
                instructor=Instructor(name="Mr. Kiran Rao", email="kiran.rao@univ.edu", department="Web Technologies"),
                enrolled_count=22,
                is_active=True,
                created_at=datetime(2024, 3, 1)
            ),
            Course(
                id="CLOUD201",
                title="Cloud Computing on AWS",
                description="Master AWS services: EC2, S3, RDS, Lambda, and CloudFormation. Prepare for AWS Solutions Architect certification.",
                category=CourseCategory.CLOUD,
                credits=3,
                max_students=45,
                instructor=Instructor(name="Ms. Sneha Patil", email="sneha.patil@univ.edu", department="Cloud Infrastructure"),
                enrolled_count=19,
                is_active=True,
                created_at=datetime(2024, 2, 15)
            ),
            Course(
                id="DEVOPS101",
                title="DevOps & CI/CD with Docker",
                description="Learn Docker, Kubernetes, GitHub Actions, Terraform, and GitOps workflows for modern software delivery.",
                category=CourseCategory.DEVOPS,
                credits=3,
                max_students=40,
                instructor=Instructor(name="Mr. Arjun Nair", email="arjun.nair@univ.edu", department="DevOps"),
                enrolled_count=31,
                is_active=True,
                created_at=datetime(2024, 3, 10)
            ),
            Course(
                id="MATH201",
                title="Linear Algebra for ML",
                description="Vectors, matrices, eigenvalues, SVD, and PCA — the mathematical backbone of machine learning and data science.",
                category=CourseCategory.MATH,
                credits=3,
                max_students=60,
                instructor=Instructor(name="Prof. Deepa Krishnan", email="deepa.k@univ.edu", department="Mathematics"),
                enrolled_count=8,
                is_active=True,
                created_at=datetime(2024, 1, 8)
            ),
            Course(
                id="AI401",
                title="LLMs & Prompt Engineering",
                description="Understand transformer architectures, fine-tuning, RAG, and prompt engineering for production AI applications.",
                category=CourseCategory.AI,
                credits=4,
                max_students=25,
                instructor=Instructor(name="Dr. Vikram Joshi", email="vikram.joshi@univ.edu", department="Artificial Intelligence"),
                enrolled_count=24,
                is_active=True,
                created_at=datetime(2024, 4, 1)
            ),
        ]

        for course in sample_courses:
            self.courses[course.id] = course

        # Sample students
        sample_students = [
            Student(id="STU0001", name="Tejas Pokale", email="tejas@example.com", phone="+917890123456", bio="B.Tech CSE student passionate about data engineering.", created_at=datetime(2024, 1, 15)),
            Student(id="STU0002", name="Aisha Rathore", email="aisha@example.com", phone="+919876543210", bio="Full-stack developer exploring AI/ML.", created_at=datetime(2024, 2, 10)),
            Student(id="STU0003", name="Rohan Desai", email="rohan@example.com", bio="Cloud enthusiast preparing for AWS certification.", created_at=datetime(2024, 3, 5)),
        ]
        for student in sample_students:
            self.students[student.id] = student

        # Sample enrollments
        sample_enrollments = [
            Enrollment(id="ENR0001", student_id="STU0001", course_id="CS101", status=EnrollmentStatus.ACTIVE, enrolled_at=datetime(2024, 1, 20)),
            Enrollment(id="ENR0002", student_id="STU0001", course_id="DS201", status=EnrollmentStatus.ACTIVE, enrolled_at=datetime(2024, 2, 12)),
            Enrollment(id="ENR0003", student_id="STU0002", course_id="WEB101", status=EnrollmentStatus.ACTIVE, enrolled_at=datetime(2024, 3, 8)),
        ]
        for enrollment in sample_enrollments:
            self.enrollments[enrollment.id] = enrollment


# Singleton database instance
db = InMemoryDatabase()
