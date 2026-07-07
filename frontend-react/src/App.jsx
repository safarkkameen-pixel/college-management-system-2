import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';

import AdminDashboard from './pages/admin/Dashboard';
import AdminDepartments from './pages/admin/Departments';
import AdminStudents from './pages/admin/Students';
import AdminTutors from './pages/admin/Tutors';
import AdminJobs from './pages/admin/Jobs';

import TutorDashboard from './pages/tutor/Dashboard';
import TutorAttendance from './pages/tutor/Attendance';
import TutorMarks from './pages/tutor/Marks';
import TutorNotes from './pages/tutor/Notes';

import StudentDashboard from './pages/student/Dashboard';
import StudentAttendance from './pages/student/Attendance';
import StudentMarks from './pages/student/Marks';
import StudentNotes from './pages/student/Notes';
import StudentJobs from './pages/student/Jobs';

import './styles/style.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['admin']}><AdminDepartments /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/tutors" element={<ProtectedRoute allowedRoles={['admin']}><AdminTutors /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><AdminJobs /></ProtectedRoute>} />

          {/* Tutor routes */}
          <Route path="/tutor/dashboard" element={<ProtectedRoute allowedRoles={['tutor']}><TutorDashboard /></ProtectedRoute>} />
          <Route path="/tutor/attendance" element={<ProtectedRoute allowedRoles={['tutor']}><TutorAttendance /></ProtectedRoute>} />
          <Route path="/tutor/marks" element={<ProtectedRoute allowedRoles={['tutor']}><TutorMarks /></ProtectedRoute>} />
          <Route path="/tutor/notes" element={<ProtectedRoute allowedRoles={['tutor']}><TutorNotes /></ProtectedRoute>} />

          {/* Student routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><StudentAttendance /></ProtectedRoute>} />
          <Route path="/student/marks" element={<ProtectedRoute allowedRoles={['student']}><StudentMarks /></ProtectedRoute>} />
          <Route path="/student/notes" element={<ProtectedRoute allowedRoles={['student']}><StudentNotes /></ProtectedRoute>} />
          <Route path="/student/jobs" element={<ProtectedRoute allowedRoles={['student']}><StudentJobs /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}