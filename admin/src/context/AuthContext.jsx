import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin as loginApi, getAdminProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gold_admin_token');
    if (token) {
      getAdminProfile()
        .then((res) => setAdmin(res.data?.data))
        .catch(() => {
          localStorage.removeItem('gold_admin_token');
          setAdmin(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    if (res.data?.data?.token) {
      localStorage.setItem('gold_admin_token', res.data.data.token);
      setAdmin(res.data.data);
      return res.data.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('gold_admin_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

