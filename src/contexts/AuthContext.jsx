import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const adminToken = localStorage.getItem('adminToken');
    const customerData = localStorage.getItem('customerData');

    if (adminToken) {
      try {
        const adminData = JSON.parse(adminToken);
        setIsAdmin(true);
        setIsAuthenticated(true);
        setCurrentUser(adminData);
      } catch (error) {
        localStorage.removeItem('adminToken');
      }
    } else if (customerData) {
      try {
        const customer = JSON.parse(customerData);
        setIsAuthenticated(true);
        setCurrentUser(customer);
      } catch (error) {
        localStorage.removeItem('customerData');
      }
    }
    setLoading(false);
  }, []);

  const loginAdmin = (email, password) => {
    // In production, validate against Supabase
    // For now, using demo credentials
    if (email === 'admin@instantcare.com' && password === 'admin123') {
      const adminData = { email, role: 'admin', id: 'admin-1' };
      localStorage.setItem('adminToken', JSON.stringify(adminData));
      setIsAdmin(true);
      setIsAuthenticated(true);
      setCurrentUser(adminData);
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const loginCustomer = (customerData) => {
    localStorage.setItem('customerData', JSON.stringify(customerData));
    setIsAuthenticated(true);
    setCurrentUser(customerData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('customerData');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
  };

  const value = {
    isAuthenticated,
    isAdmin,
    currentUser,
    loading,
    loginAdmin,
    loginCustomer,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};