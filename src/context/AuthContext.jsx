import { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEY } from "../api/client";

const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth); // { role: 'ADMIN'|'USER', token, profile }

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  function login(role, { token, profile }) {
    setAuth({ role, token, profile });
  }

  function logout() {
    setAuth(null);
  }

  const value = {
    auth,
    isAuthenticated: Boolean(auth),
    role: auth?.role || null,
    profile: auth?.profile || null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
