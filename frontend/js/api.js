/**
 * api.js - the only file that talks to the backend.
 * Loaded on every page before layout.js and any page-specific script.
 */

const API_BASE = 'http://localhost:5000/api';

// ---- Session storage -------------------------------------------------
// This is a downloaded project that runs on your own machine - it is NOT
// embedded in a sandboxed preview, so plain localStorage is the right and
// expected place to keep a JWT for a small demo app like this.

function getToken() {
  return localStorage.getItem('cms_token');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('cms_user') || 'null');
  } catch {
    return null;
  }
}

function setSession(token, user) {
  localStorage.setItem('cms_token', token);
  localStorage.setItem('cms_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('cms_token');
  localStorage.removeItem('cms_user');
}

function logout() {
  clearSession();
  window.location.href = '/login.html';
}

// ---- Route guard -------------------------------------------------------
// Call at the top of every protected page: requireAuth(['admin']) etc.
// Returns the current user object, or redirects to /login.html.

function requireAuth(allowedRoles = []) {
  const user = getUser();
  const token = getToken();
  if (!token || !user) {
    window.location.href = '/login.html';
    return null;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    window.location.href = `/${user.role}/dashboard.html`;
    return null;
  }
  return user;
}

// ---- Fetch wrapper -------------------------------------------------------
// api('/students') -> GET
// api('/students', { method: 'POST', body: {...} }) -> JSON POST
// api('/notes', { method: 'POST', body: formData, isForm: true }) -> file upload

async function api(endpoint, { method = 'GET', body = null, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isForm && body !== null) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body === null ? null : (isForm ? body : JSON.stringify(body))
    });
  } catch (networkErr) {
    throw new Error('Could not reach the server. Is the backend running on http://localhost:5000?');
  }

  if (res.status === 401) {
    clearSession();
    window.location.href = '/login.html';
    throw new Error('Session expired. Please log in again.');
  }

  // Some endpoints (file download) don't return JSON - callers handle those directly.
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json().catch(() => ({})) : null;

  if (!res.ok) {
    throw new Error((data && data.message) || `Request failed (${res.status}).`);
  }
  return data;
}

// ---- Small shared helpers used across pages -------------------------------------------------------

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showAlert(elId, message, type = 'error') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type}`;
  el.classList.remove('hidden');
}

function hideAlert(elId) {
  const el = document.getElementById(elId);
  if (el) el.classList.add('hidden');
}

// Downloads a protected file (one that requires the Authorization header)
// by fetching it as a blob and triggering a save dialog client-side.
async function downloadNote(noteId, filename) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/notes/${noteId}/download`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    alert('Could not download this file.');
    return;
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'note';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
