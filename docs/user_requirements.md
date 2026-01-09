# User Requirements Specification

## 1. Introduction

This document outlines the user requirements for the Web Skripsi E-Learning Platform. The platform is designed to provide an interactive learning experience with gamification elements, supporting three primary user roles: Students, Tutors, and Administrators.

## 2. User Roles

- **Student**: Learners who enroll in courses, complete lessons and assessments, and engage with gamification features.
- **Tutor**: Instructors responsible for creating courses, managing content, and monitoring student progress.
- **Admin**: System administrators who oversee the platform, users, and overall content quality.

## 3. Functional Requirements

### 3.1 Authentication & User Management

- **FR-01**: The system must allow users to register and login using email and password.
- **FR-02**: The system shall support Two-Factor Authentication (2FA) for enhanced security.
- **FR-03**: Users must be able to manage their profile, including avatar and personal information.
- **FR-04**: The system must assign roles (Student, Tutor, Admin) to users upon registration or administration.

### 3.2 Course Management (Tutor)

- **FR-05**: Tutors must be able to create, edit, and delete courses.
- **FR-06**: Tutors must be able to categorize courses and set difficulty levels (beginner, intermediate, advanced).
- **FR-07**: Tutors shall be able to organize course content into lessons with ordering and meeting schedules.
- **FR-08**: Tutors must be able to upload various content types (Videos, Files, Links) to lessons.
- **FR-09**: Tutors must be able to publish or unpublish courses.

### 3.3 Learning & Enrollment (Student)

- **FR-10**: Students must be able to browse and search for available courses.
- **FR-11**: Students must be able to enroll in courses.
- **FR-12**: Students must be able to track their progress within a course (percentage completed).
- **FR-13**: Students shall be able to view course materials (watch videos, download files).
- **FR-14**: Students must be able to mark attendance for live sessions or lessons.
- **FR-15**: The system must track content completion status for each user.

### 3.4 Assessment & Grading

- **FR-16**: The system must support different assessment types: Practice, Quiz, and Final Exam.
- **FR-17**: The system must support various question types: Multiple Choice, Fill in the Blank, Essay.
- **FR-18**: **Practice Assessments**: Must allow power-ups and do not count toward final grades.
- **FR-19**: **Quizzes**: Contribute to the course score and may have time limits.
- **FR-20**: **Final Exams**: Must be weighted (51-100% of final score), allow no power-ups, and support remedial attempts.
- **FR-21**: The system must automatically grade objective questions (Multiple Choice, Fill in the Blank).
- **FR-22**: Tutors must be able to manually grade subjective questions (Essays) and provide feedback.
- **FR-23**: The system must calculate Final Scores based on Quiz and Final Exam weights.
- **FR-24**: Only one Final Exam is allowed per course.
- **FR-25**: The system must support question reordering within assessments.

### 3.5 Gamification (Student)

- **FR-26**: The system must award XP (Experience Points) for completed activities (lessons, tasks, assessments).
- **FR-27**: The system must track User Levels based on total XP.
- **FR-28**: The system shall maintain Daily Streaks for consecutive login/activity.
- **FR-29**: The system shall track Longest Streak achieved by users.
- **FR-30**: The system must manage a Points Balance for redeeming rewards.
- **FR-31**: Students must be able to earn Achievements based on specific criteria (lessons completed, quizzes passed, streak milestones).
- **FR-32**: Students must be able to purchase and use Power-ups (e.g., Time Extension, Hint) in applicable assessments.
- **FR-33**: Students must be able to view a Leaderboard or their ranking.
- **FR-34**: Students must be able to view and claim available Rewards using points.
- **FR-35**: The system must assign Daily Tasks to users with XP rewards.

### 3.6 Communication

- **FR-36**: The system must facilitate messaging between Tutors and Students.
- **FR-37**: The system must track message read status.
- **FR-38**: The system must notify users of important events (e.g., graded assessment, new achievement).

## 4. Non-Functional Requirements

- **NFR-01 (Security)**: All passwords must be hashed and stored securely.
- **NFR-02 (Performance)**: The system should load course content pages within 2 seconds under normal load.
- **NFR-03 (Scalability)**: The database design shall support a growing number of course records and activity logs.
- **NFR-04 (Usability)**: The interface should be responsive and accessible on desktop and tablet devices.
- **NFR-05 (Reliability)**: Assessment timers must be accurate and state must be preserved in case of accidental refresh.
- **NFR-06 (Data Integrity)**: Final scores must be calculated consistently across all assessment attempts.
