import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '◆' },
    { to: '/admin/departments', label: 'Departments', icon: '▤' },
    { to: '/admin/students', label: 'Students', icon: '☻' },
    { to: '/admin/tutors', label: 'Tutors', icon: '✎' },
    { to: '/admin/jobs', label: 'Placement Jobs', icon: '✦' }
  ],
  tutor: [
    { to: '/tutor/dashboard', label: 'Dashboard', icon: '◆' },
    { to: '/tutor/attendance', label: 'Attendance', icon: '✓' },
    { to: '/tutor/marks', label: 'Marks Entry', icon: '✎' },
    { to: '/tutor/notes', label: 'Notes', icon: '▤' }
  ],
  student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: '◆' },
    { to: '/student/attendance', label: 'Attendance', icon: '✓' },
    { to: '/student/marks', label: 'Marks & Performance', icon: '✎' },
    { to: '/student/notes', label: 'Notes', icon: '▤' },
    { to: '/student/jobs', label: 'Placements', icon: '✦' }
  ]
};

export default function Sidebar({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV_LINKS[role] || [];
  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside id="sidebar">
      <div className="sidebar-brand">🎓 CampusHub</div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span> {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initial}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">
              {role}{user?.department ? ` · ${user.department}` : ''}
            </div>
          </div>
        </div>
        <button className="btn btn-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}