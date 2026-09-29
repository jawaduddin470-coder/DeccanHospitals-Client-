import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalLayout } from '../components/layout/GlobalLayout';
import { AdminProtectedRoute } from '../components/admin/AdminProtectedRoute';
import { AdminLayout } from '../components/admin/AdminLayout';

// Public Pages (Lazy Loaded)
const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('../pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ServicesPage = lazy(() => import('../pages/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const DoctorsPage = lazy(() => import('../pages/DoctorsPage').then((m) => ({ default: m.DoctorsPage })));
const GalleryPage = lazy(() => import('../pages/GalleryPage').then((m) => ({ default: m.GalleryPage })));
const AppointmentPage = lazy(() => import('../pages/AppointmentPage').then((m) => ({ default: m.AppointmentPage })));
const ContactPage = lazy(() => import('../pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Admin Pages (Lazy Loaded)
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminAppointmentsPage = lazy(() => import('../pages/admin/AdminAppointmentsPage').then((m) => ({ default: m.AdminAppointmentsPage })));
const AdminAvailabilityPage = lazy(() => import('../pages/admin/AdminAvailabilityPage').then((m) => ({ default: m.AdminAvailabilityPage })));
const AdminDoctorsPage = lazy(() => import('../pages/admin/AdminDoctorsPage').then((m) => ({ default: m.AdminDoctorsPage })));
const AdminGalleryPage = lazy(() => import('../pages/admin/AdminGalleryPage').then((m) => ({ default: m.AdminGalleryPage })));
const AdminServicesPage = lazy(() => import('../pages/admin/AdminServicesPage').then((m) => ({ default: m.AdminServicesPage })));
const AdminHospitalPage = lazy(() => import('../pages/admin/AdminHospitalPage').then((m) => ({ default: m.AdminHospitalPage })));

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-[#0879A5] border-t-transparent animate-spin" />
      <span className="text-xs font-mono text-[#0879A5] uppercase tracking-wider">
        Loading Deccan Care...
      </span>
    </div>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Public Website Layout & Routes */}
        <Route element={<GlobalLayout />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<PageLoader />}>
                <HomePage />
              </Suspense>
            }
          />
          <Route
            path="about"
            element={
              <Suspense fallback={<PageLoader />}>
                <AboutPage />
              </Suspense>
            }
          />
          <Route
            path="services"
            element={
              <Suspense fallback={<PageLoader />}>
                <ServicesPage />
              </Suspense>
            }
          />
          <Route
            path="doctors"
            element={
              <Suspense fallback={<PageLoader />}>
                <DoctorsPage />
              </Suspense>
            }
          />
          <Route
            path="gallery"
            element={
              <Suspense fallback={<PageLoader />}>
                <GalleryPage />
              </Suspense>
            }
          />
          <Route
            path="appointment"
            element={
              <Suspense fallback={<PageLoader />}>
                <AppointmentPage />
              </Suspense>
            }
          />
          <Route
            path="contact"
            element={
              <Suspense fallback={<PageLoader />}>
                <ContactPage />
              </Suspense>
            }
          />
          <Route
            path="login/admin"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminLoginPage />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<PageLoader />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Route>

        {/* 2. Authenticated & Protected Admin Control Center Layout & Routes */}
        <Route
          path="admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="appointments"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminAppointmentsPage />
              </Suspense>
            }
          />
          <Route
            path="availability"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminAvailabilityPage />
              </Suspense>
            }
          />
          <Route
            path="doctors"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminDoctorsPage />
              </Suspense>
            }
          />
          <Route
            path="gallery"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminGalleryPage />
              </Suspense>
            }
          />
          <Route
            path="services"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminServicesPage />
              </Suspense>
            }
          />
          <Route
            path="hospital"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminHospitalPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
