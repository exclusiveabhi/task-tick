import React, { createContext, useState, useEffect, useRef } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch (e) {
      return true;
    }
  };

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
      setIsAuthenticated(false);
      localStorage.removeItem("token");
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  };
  const intervalRef = useRef();

  useEffect(() => {
    checkAuth();
    intervalRef.current = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token && isTokenExpired(token)) {
        logout();
      }
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
