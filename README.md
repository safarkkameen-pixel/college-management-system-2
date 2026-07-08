# 🎓 CampusHub — College Management System

A full-stack college management web application with role-based dashboards for **Admin**, **Tutor**, and **Student**.

**Tech Stack:**
- **Frontend:** React + Vite + React Router + Recharts + Axios
- **Backend:** Node.js + Express + JWT authentication + bcrypt
- **Database:** PostgreSQL via [Neon](https://neon.tech) (free cloud Postgres)
- **Version Control:** GitHub

---

## 📁 Project Structure

```
college-management-system-2/
├── backend/                        # Node.js + Express API
│   ├── server.js                   # App entry point
│   ├── seed.js                     # Seed sample data
│   ├── .env.example                # Environment variables template
│   ├── middleware/auth.js          # JWT verification + role guard
│   ├── utils/db.js                 # Neon Postgres connection
│   ├── utils/store.js              # Generic CRUD helpers
│   ├── uploads/                    # Uploaded note files
│   └── routes/                     # API route files
│       ├── auth.routes.js
│       ├── department.routes.js
│       ├── student.routes.js
│       ├── tutor.routes.js
│       ├── attendance.routes.js
│       ├── marks.routes.js
│       ├── notes.routes.js
│       ├── job.routes.js
│       └── analytics.routes.js
└── frontend-react/                 # React + Vite frontend
    └── src/
        ├── App.jsx                 # Router setup
        ├── main.jsx                # Entry point
        ├── api/axios.js            # Axios API wrapper
        ├── context/AuthContext.jsx # Auth state management
        ├── components/
        │   ├── Sidebar.jsx         # Shared navigation
        │   └── ProtectedRoute.jsx  # Auth guard
        ├── pages/
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── admin/              # Dashboard, Departments, Students, Tutors, Jobs
        │   ├── tutor/              # Dashboard, Attendance, Marks, Notes
        │   └── student/            # Dashboard, Attendance, Marks, Notes, Jobs
        └── styles/style.css        # Shared design system
```

---

## ⚡ Quick Start

You need **Node.js 18+** installed. Check with `node -v`.

### Step 1 — Create a free Neon database

1. Go to **https://neon.tech** and sign up (free, no card needed)
2. Click **New Project** → name it `campushub` → Create
3. Copy the **Connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2 — Set up the backend

Open a terminal and run:

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your values:
```
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=any_long_random_string_here
PORT=5000
```

Then seed the database and start the server:

```bash
npm run seed
npm run dev
```

You should see:
```
🎓 College Management API running at http://localhost:5000
   Database: Neon Postgres ✓
```

### Step 3 — Set up the React frontend

Open a **second terminal** and run:

```bash
cd frontend-react
npm install
npm run dev
```

You should see:
```
VITE v8.x.x  ready in xxx ms
➜  Local: http://localhost:5173/
```

### Step 4 — Open in browser

Go to **http://localhost:5173** and log in with any of the demo credentials below.

---

## 🔐 Demo Login Credentials

Password for **everyone**: `password123`

| Role | Email | Info |
|---|---|---|
| Admin | admin@college.edu | Full access |
| Tutor | ramesh.tutor@college.edu | CSE — Data Structures |
| Tutor | anita.tutor@college.edu | ECE — Digital Electronics |
| Student | arjun.mehta@college.edu | CSE |
| Student | priya.nair@college.edu | CSE |
| Student | rahul.verma@college.edu | CSE |
| Student | sneha.iyer@college.edu | ECE |
| Student | karthik.raja@college.edu | ECE |
| Student | divya.krishnan@college.edu | CIVIL |
| Student | mohammed.faizal@college.edu | EEE |

> Re-run `npm run seed` in the backend folder at any time to reset all data back to this state.

---

## ✅ Features

### 🔐 Authentication
- JWT-based login and signup
- Role-based access control (Admin / Tutor / Student)
- Protected routes on both frontend and backend

### 👨‍💼 Admin
- Manage departments (add, edit, delete)
- Manage students and tutors (create logins, update details)
- Analytics dashboard with charts — department distribution, attendance trends, top performers, pass/fail ratio
- Post placement jobs and manage applicant status

### 👨‍🏫 Tutor
- Mark daily attendance per subject with a class roster view
- Enter and update exam marks per student
- Upload notes/files for students to download
- View department student list and performance overview

### 🎓 Student
- View attendance percentage overall and per subject with full history
- View marks per subject and exam type with pass/fail result
- Browse and download notes shared by tutors
- Browse and apply to placement jobs, track application status
- Performance insight summary on the dashboard

---

## 🌐 API Reference

All routes prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | Public | Create student/tutor account |
| POST | `/auth/login` | Public | Get JWT token |
| GET | `/auth/me` | Any | Current user + profile |
| GET/POST/PUT/DELETE | `/departments` | Admin writes, public reads | Manage departments |
| GET/POST/PUT/DELETE | `/students` | Admin | Manage students |
| GET/POST/PUT/DELETE | `/tutors` | Admin | Manage tutors |
| GET | `/students/:id/performance` | Self/Admin | Attendance % + grade |
| POST | `/attendance` | Tutor/Admin | Mark attendance |
| GET | `/attendance/class` | Tutor/Admin | Class roster for a date |
| GET | `/attendance/student/:id` | Self/Tutor/Admin | Full attendance history |
| POST | `/marks` | Tutor/Admin | Enter/update marks |
| GET | `/marks/student/:id` | Self/Tutor/Admin | All marks + average |
| POST | `/notes` (multipart) | Tutor/Admin | Upload a note file |
| GET | `/notes` | Any | Browse notes |
| GET | `/notes/:id/download` | Any | Download file |
| GET/POST/DELETE | `/jobs` | Admin writes, all read | Manage jobs |
| POST | `/jobs/:id/apply` | Student | Apply to a job |
| GET | `/jobs/applications/my` | Student | My applications |
| GET | `/jobs/:id/applications` | Admin | Applicants for a job |
| PUT | `/jobs/applications/:id` | Admin | Update application status |
| GET | `/analytics/overview` | Admin | Dashboard metrics |
