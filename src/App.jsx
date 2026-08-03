import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import WhatsAppButton from '@/components/WhatsAppButton';
import HealthAIChatBot from '@/components/HealthAIChatBot';

// New Pages Structure
import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import BookNursePage from '@/pages/BookNursePage';
import ContactUsPage from '@/pages/ContactUsPage';

// Admin & Dashboard
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboard from '@/pages/AdminDashboard';
import CustomerDashboard from '@/pages/CustomerDashboard';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <WhatsAppButton />
          <HealthAIChatBot />
          <Routes>
            {/* Main Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/book" element={<BookNursePage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            
            {/* Kept for backward compatibility or direct links if needed */}
            <Route path="/scheduled-booking" element={<BookNursePage />} /> 
            <Route path="/emergency-booking" element={<BookNursePage />} />

            {/* Protected / Admin Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;