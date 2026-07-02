# 🎓 CampusHub — College Management System

A full-stack college management web app with role-based dashboards for **Admin**, **Tutor**, and **Student**, built with:

- **Backend:** Node.js + Express, JWT authentication, bcrypt password hashing, Multer file uploads
- **Database:** a tiny built-in JSON file store (`backend/data/db.json`) — no MongoDB/Postgres install required to get started
- **Frontend:** plain HTML, CSS and JavaScript (no build step, no framework) styled with a custom "academic ledger" design system, plus Chart.js for the analytics dashboard

No paid services, no Docker, no database server to install. Clone it, run two commands, and it works.

---

## 1. Folder structure

```
college-management-system/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── seed.js                # Wipes & re-fills the database with sample data
│   ├── .env.example           # Copy to .env and edit
│   ├── data/db.json           # Auto-created on first run (your "database")
│   ├── uploads/                # Uploaded note files land here
│   ├── middleware/auth.js      # JWT verification + role-based access control
│   ├── utils/db.js             # Reads/writes the JSON file
│   ├── utils/store.js          # Generic CRUD helpers used by every route
│   └── routes/                 # auth, departments, students, tutors,
│                                # attendance, marks, notes, jobs, analytics
└── frontend/
    ├── index.html, login.html, signup.html
    ├── css/style.css           # Shared design system
    ├── js/api.js               # Fetch wrapper + session/auth helpers
    ├── js/layout.js            # Shared sidebar navigation
    ├── admin/                  # dashboard, departments, students, tutors, jobs
    ├── tutor/                  # dashboard, attendance, marks, notes
    └── student/                # dashboard, attendance, marks, notes, jobs
```

---

## 2. Quick start

You need **Node.js 18+** installed. Check with `node -v`.

### Step 1 — Create a free Neon database

1. Go to **https://neon.tech** and sign up (free, no card needed)
2. Click **New Project** → give it a name like `campushub` → Create
3. On the project page, find **Connection Details** → copy the **Connection string**
   It looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
4. Keep this tab open — you'll paste it in the next step

### Step 2 — Start the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open the `.env` file in VS Code and paste your Neon connection string:
```
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=any_long_random_string_here
PORT=5000
```

Then:
```bash
npm run seed
npm run dev
```

Wait for `🎓 College Management API running at http://localhost:5000` and `Database: Neon Postgres ✓`

### Step 3 — Start the frontend

Open a **second** terminal (keep the backend running in the first one):

```bash
cd frontend
npx serve . -p 3000
```

Then open **http://localhost:3000/login.html** in your browser.

> Any static file server works here (`npx serve .`, `python -m http.server 3000`, the VS Code "Live Server" extension, etc.) — the only requirement is that you serve the `frontend/` folder as the *root*, since the pages link to absolute paths like `/css/style.css` and `/admin/dashboard.html`.

If your backend isn't on `http://localhost:5000`, update the `API_BASE` constant at the top of `frontend/js/api.js`.

---

## 3. Sample login credentials

Created automatically by `npm run seed`. Password for **everyone** is `password123`.

| Role    | Email                          | Department |
|---------|---------------------------------|------------|
| Admin   | admin@college.edu               | —          |
| Tutor   | ramesh.tutor@college.edu        | CSE (Data Structures) |
| Tutor   | anita.tutor@college.edu         | ECE (Digital Electronics) |
| Student | arjun.mehta@college.edu         | CSE |
| Student | priya.nair@college.edu          | CSE |
| Student | rahul.verma@college.edu         | CSE |
| Student | sneha.iyer@college.edu          | ECE |
| Student | karthik.raja@college.edu        | ECE |
| Student | divya.krishnan@college.edu      | CIVIL |
| Student | mohammed.faizal@college.edu     | EEE |

You can also click **"Create a student or tutor account"** on the login page to sign up fresh accounts (admin accounts are intentionally not self-serve — that's standard practice for a system like this).

Re-run `npm run seed` at any time to reset everything back to this state.

---

## 4. Feature checklist

**Authentication**
- [x] JWT-based login/signup, bcrypt-hashed passwords
- [x] Role-based access control enforced on every backend route (not just hidden in the UI)

**Admin**
- [x] Manage departments (add/edit/delete)
- [x] Add/update/remove students and tutors (creates their login automatically)
- [x] Analytics dashboard: total students, department-wise distribution, attendance trend, top performers, pass/fail ratio
- [x] Post and manage placement jobs, review and update applicant status

**Tutor**
- [x] Mark daily attendance per subject/date (class roster view)
- [x] Upload notes (PDF/DOC/PPT/ZIP, etc.) for their department
- [x] Enter and update exam marks per student/subject/exam type
- [x] View department student list and performance

**Student**
- [x] View attendance % overall and per subject, with full history
- [x] View marks per subject/exam with pass/fail and overall average
- [x] Browse and download notes shared by tutors, filterable by subject
- [x] Performance insight summary on the dashboard
- [x] Browse and apply to placement jobs, track application status

---

## 5. API reference (brief)

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | public | Create a student/tutor account |
| POST | `/auth/login` | public | Get a JWT |
| GET | `/auth/me` | any | Current user + profile |
| GET/POST/PUT/DELETE | `/departments` | admin writes, public reads | Manage departments |
| GET/POST/PUT/DELETE | `/students` | admin | Manage students |
| GET/POST/PUT/DELETE | `/tutors` | admin | Manage tutors |
| GET | `/students/:id/performance` | self/admin | Attendance % + marks average + grade |
| POST | `/attendance` | tutor/admin | Mark/update attendance |
| GET | `/attendance/class` | tutor/admin | Class roster for a subject/date |
| GET | `/attendance/student/:id` | self/tutor/admin | History + percentages |
| POST/PUT | `/marks` | tutor/admin | Enter/update marks |
| GET | `/marks/student/:id` | self/tutor/admin | Marks + average + pass/fail |
| POST | `/notes` (multipart) | tutor/admin | Upload a note file |
| GET | `/notes` | any | Browse, filter by `?department=&subject=` |
| GET | `/notes/:id/download` | any | Download the file |
| GET/POST/PUT/DELETE | `/jobs` | admin writes, all read | Manage placement jobs |
| POST | `/jobs/:id/apply` | student | Apply to a job |
| GET | `/jobs/applications/my` | student | My applications |
| GET | `/jobs/:id/applications` | admin | Applicants for a job |
| PUT | `/jobs/applications/:id` | admin | Update application status |
| GET | `/analytics/overview` | admin | Dashboard metrics |

---

## 6. Moving beyond a demo

This project is intentionally zero-config so you can get it running in minutes. Before using it for anything real, consider:

- **Swap the JSON file store for a real database** (MongoDB, PostgreSQL, MySQL). Every route already goes through `backend/utils/store.js` — that's the only file you'd need to rewrite.
- **Set a strong, random `JWT_SECRET`** in `.env` (never commit `.env` to version control).
- **Add input validation** (e.g. with `zod` or `joi`) on top of the basic checks already in place.
- **Move file uploads to cloud storage** (S3, Cloudinary, etc.) instead of local disk if you deploy to a server with an ephemeral filesystem.
- **Add pagination** to list endpoints once you have hundreds/thousands of records.
- **Add HTTPS, rate limiting, and helmet** before exposing this to the public internet.

---

## 7. Troubleshooting

- **"Could not reach the server"** on the frontend → make sure `npm run dev` is still running in the backend terminal, and that it's on port 5000 (or update `API_BASE` in `frontend/js/api.js`).
- **Port 5000 already in use** → change `PORT` in `backend/.env`, then also update `API_BASE` in `frontend/js/api.js` to match.
- **CORS errors in the browser console** → confirm you're opening the frontend through `http://localhost:3000` (or whatever static server URL), not by double-clicking the HTML files directly (`file://` origins can behave inconsistently with `fetch`).
- **Uploaded notes "404 file missing"** → don't delete the `backend/uploads/` folder manually while the server is running; use the delete button in the UI instead, which removes the database record and the file together.
