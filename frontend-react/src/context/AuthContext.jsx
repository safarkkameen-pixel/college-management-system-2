import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('cms_token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cms_user') || 'null');
    } catch {
      return null;
    }
  });

  function login(token, user) {
    localStorage.setItem('cms_token', token);
    localStorage.setItem('cms_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}