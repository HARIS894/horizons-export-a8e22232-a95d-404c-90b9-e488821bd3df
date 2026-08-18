import React from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import WhatsAppButton from '@/components/WhatsAppButton';
import HealthAIChatBot from '@/components/HealthAIChatBot';
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation';
import GlobalInquiryLauncher from '@/components/inquiry/GlobalInquiryLauncher';
import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import PricingPage from '@/pages/PricingPage';
import BookNursePage from '@/pages/BookNursePage';
import ContactUsPage from '@/pages/ContactUsPage';
import HealthcareLibraryPage from '@/pages/HealthcareLibraryPage';
import ContentLibraryPage from '@/pages/ContentLibraryPage';
import ServiceDetailPage from '@/pages/ServiceDetailPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboard from '@/pages/AdminDashboard';
import CustomerDashboard from '@/pages/CustomerDashboard';
import HealthcareCrmPortalPage from '@/pages/HealthcareCrmPortalPage';
import NriFamilyPortalPage from '@/pages/NriFamilyPortalPage';

const AppShell = () => {
  const location = useLocation();
  const hidesFloatingLaunchers = location.pathname === '/pricing';

  return <>
    <ScrollToTop />
    {!hidesFloatingLaunchers ? <WhatsAppButton /> : null}
    {!hidesFloatingLaunchers ? <GlobalInquiryLauncher /> : null}
    {!hidesFloatingLaunchers ? <HealthAIChatBot /> : null}
    <BreadcrumbNavigation />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/services/:slug" element={<ServiceDetailPage />} />
      <Route path="/book" element={<BookNursePage />} />
      <Route path="/contact" element={<ContactUsPage />} />
      <Route path="/healthcare-library" element={<HealthcareLibraryPage />} />
      <Route path="/healthcare-library/:articleSlug" element={<ContentLibraryPage />} />
      <Route path="/disease-library" element={<ContentLibraryPage />} />
      <Route path="/disease-library/:articleSlug" element={<ContentLibraryPage />} />
      <Route path="/treatment-library" element={<ContentLibraryPage />} />
      <Route path="/treatment-library/:articleSlug" element={<ContentLibraryPage />} />
      <Route path="/elder-care-library" element={<ContentLibraryPage />} />
      <Route path="/elder-care-library/:articleSlug" element={<ContentLibraryPage />} />
      <Route path="/nri-care-library" element={<ContentLibraryPage />} />
      <Route path="/nri-care-library/:articleSlug" element={<ContentLibraryPage />} />
      <Route path="/final-journey-library" element={<ContentLibraryPage />} />
      <Route path="/final-journey-library/:articleSlug" element={<ContentLibraryPage />} />
      <Route path="/nurse-at-home" element={<ServiceDetailPage />} />
      <Route path="/elder-care" element={<ServiceDetailPage />} />
      <Route path="/patient-attendant" element={<ServiceDetailPage />} />
      <Route path="/icu-at-home" element={<ServiceDetailPage />} />
      <Route path="/doctor-at-home" element={<ServiceDetailPage />} />
      <Route path="/physiotherapy-at-home" element={<ServiceDetailPage />} />
      <Route path="/lab-test-at-home" element={<ServiceDetailPage />} />
      <Route path="/injection-at-home" element={<ServiceDetailPage />} />
      <Route path="/ambulance-service" element={<ServiceDetailPage />} />
      <Route path="/palliative-care" element={<ServiceDetailPage />} />
      <Route path="/cancer-care-at-home" element={<ServiceDetailPage />} />
      <Route path="/stroke-care-at-home" element={<ServiceDetailPage />} />
      <Route path="/scheduled-booking" element={<BookNursePage />} />
      <Route path="/emergency-booking" element={<BookNursePage />} />
      <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/healthcare-crm" element={<ProtectedRoute adminOnly><HealthcareCrmPortalPage /></ProtectedRoute>} />
      <Route path="/family-portal" element={<ProtectedRoute><NriFamilyPortalPage /></ProtectedRoute>} />
    </Routes>
  </>;
};

function App() {
  return <HelmetProvider><AuthProvider><Router><AppShell /><Toaster /></Router></AuthProvider></HelmetProvider>;
}

export default App;
