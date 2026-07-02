/**
 * layout.js - builds the left sidebar (nav + user chip + logout) so every
 * dashboard page doesn't have to repeat that markup. Call renderSidebar(role)
 * after requireAuth() near the top of each page's inline script.
 */

const NAV_LINKS = {
  admin: [
    { href: '/admin/dashboard.html', label: 'Dashboard', icon: '◆' },
    { href: '/admin/departments.html', label: 'Departments', icon: '▤' },
    { href: '/admin/students.html', label: 'Students', icon: '☻' },
    { href: '/admin/tutors.html', label: 'Tutors', icon: '✎' },
    { href: '/admin/jobs.html', label: 'Placement Jobs', icon: '✦' }
  ],
  tutor: [
    { href: '/tutor/dashboard.html', label: 'Dashboard', icon: '◆' },
    { href: '/tutor/attendance.html', label: 'Attendance', icon: '✓' },
    { href: '/tutor/marks.html', label: 'Marks Entry', icon: '✎' },
    { href: '/tutor/notes.html', label: 'Notes', icon: '▤' }
  ],
  student: [
    { href: '/student/dashboard.html', label: 'Dashboard', icon: '◆' },
    { href: '/student/attendance.html', label: 'Attendance', icon: '✓' },
    { href: '/student/marks.html', label: 'Marks & Performance', icon: '✎' },
    { href: '/student/notes.html', label: 'Notes', icon: '▤' },
    { href: '/student/jobs.html', label: 'Placements', icon: '✦' }
  ]
};

function renderSidebar(role) {
  const user = getUser();
  const links = NAV_LINKS[role] || [];
  const currentPath = window.location.pathname;

  const navHtml = links
    .map(
      (link) => `
    <a href="${link.href}" class="nav-link ${currentPath === link.href ? 'active' : ''}">
      <span class="nav-icon">${link.icon}</span> ${link.label}
    </a>`
    )
    .join('');

  const initial = (user && user.name ? user.name.charAt(0) : '?').toUpperCase();

  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-brand">🎓 CampusHub</div>
    <nav class="sidebar-nav">${navHtml}</nav>
    <div class="sidebar-footer">
      <div class="user-chip">
        <div class="user-avatar">${initial}</div>
        <div>
          <div class="user-name">${user ? user.name : ''}</div>
          <div class="user-role">${role}${user && user.department ? ' · ' + user.department : ''}</div>
        </div>
      </div>
      <button class="btn btn-logout" onclick="logout()">Log out</button>
    </div>
  `;
}
