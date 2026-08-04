import React, { createContext, useContext, useState, useEffect } from 'react';
import { instantcareApi } from '@/api/instantcareApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const existing = instantcareApi.getSession();
        if (!existing?.accessToken && !existing?.refreshToken) {
          setLoading(false);
          return;
        }

        const session = await instantcareApi.me();
        const nextRoles = session.roles || [];
        setIsAuthenticated(true);
        setIsAdmin(nextRoles.includes('admin') || nextRoles.includes('coordinator'));
        setCurrentUser(session.user || session);
        setRoles(nextRoles);
      } catch {
        instantcareApi.clearSession();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const applySession = (session) => {
    const nextRoles = session.roles || [];
    setIsAuthenticated(true);
    setIsAdmin(nextRoles.includes('admin') || nextRoles.includes('coordinator'));
    setCurrentUser(session.user);
    setRoles(nextRoles);
  };

  const loginAdmin = async (email, password) => {
    try {
      const session = await instantcareApi.login('admin', { email, password, role: 'admin' });
      applySession(session);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginRole = async (role, email, password) => {
    try {
      const session = await instantcareApi.login(role, { email, password, role });
      applySession(session);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginCustomer = async (customerData) => {
    if (customerData?.email && customerData?.password && customerData?.role) {
      return loginRole(customerData.role, customerData.email, customerData.password);
    }

    setIsAuthenticated(true);
    setCurrentUser(customerData);
    setRoles(customerData?.roles || []);
    return { success: true };
  };

  const logout = async () => {
    await instantcareApi.logout();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
    setRoles([]);
  };

  const value = {
    isAuthenticated,
    isAdmin,
    currentUser,
    roles,
    loading,
    loginAdmin,
    loginRole,
    loginCustomer,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};