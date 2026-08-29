import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';

// Devotee auth - deliberately separate from AuthContext.jsx (admin auth):
// different localStorage keys and a different backend model/collection, so
// a devotee account can never be confused with (or escalate to) an admin
// session. See backend/src/middleware/auth.js's role check for the
// server-side half of that separation.
const UserAuthContext = createContext(null);

const TOKEN_KEY = 'temple_user_token';
const USER_KEY = 'temple_user_info';

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/users/register', { name, email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/users/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <UserAuthContext.Provider value={{ user, register, login, logout, isAuthenticated: !!user }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within a UserAuthProvider');
  return ctx;
}
