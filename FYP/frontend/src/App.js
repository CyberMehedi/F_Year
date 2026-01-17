import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import BookService from './pages/student/BookService';
import MyBookings from './pages/student/MyBookings';
import History from './pages/student/History';
import Profile from './pages/student/Profile';
import Notifications from './pages/student/Notifications';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import BookingsManagement from './pages/admin/BookingsManagement';
import StaffManagement from './pages/admin/StaffManagement';
import Maintenance from './pages/admin/Maintenance';
import Reports from './pages/admin/Reports';

// Cleaner pages
import CleanerDashboard from './pages/cleaner/CleanerDashboard';
import NewRequests from './pages/cleaner/NewRequests';
import TodayTasks from './pages/cleaner/TodayTasks';
import AllTasks from './pages/cleaner/AllTasks';
import MyHistory from './pages/cleaner/MyHistory';
import ReportIssues from './pages/cleaner/ReportIssues';
import Statistics from './pages/cleaner/Statistics';

// All pages implemented

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Routes>
            {/* Landing Page - New default route */}
            <Route path="/" element={<LandingPage />} />

            {/* Public routes with header and footer */}
            <Route path="/home" element={
              <>
                <Header />
                <main className="flex-1">
                  <Home />
                </main>
                <Footer />
              </>
            } />

            <Route path="/services" element={
              <>
                <Header />
                <main className="flex-1">
                  <Services />
                </main>
                <Footer />
              </>
            } />

            <Route path="/about" element={
              <>
                <Header />
                <main className="flex-1">
                  <About />
                </main>
                <Footer />
              </>
            } />

            {/* Auth routes without header/footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Student routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />

            <Route path="/student/book" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <BookService />
              </ProtectedRoute>
            } />

            <Route path="/student/bookings" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyBookings />
              </ProtectedRoute>
            } />

            <Route path="/student/history" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <History />
              </ProtectedRoute>
            } />

            <Route path="/student/profile" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/student/notifications" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Notifications />
              </ProtectedRoute>
            } />

            {/* Cleaner routes */}
            <Route path="/cleaner/dashboard" element={
              <ProtectedRoute allowedRoles={['CLEANER']}>
                <CleanerDashboard />
              </ProtectedRoute>
            } />

            <Route path="/cleaner/new-requests" element={
              <ProtectedRoute allowedRoles={['CLEANER']}>
                <NewRequests />
              </ProtectedRoute>
            } />

            <Route path="/cleaner/today" element={
              <ProtectedRoute allowedRoles={['CLEANER']}>
                <TodayTasks />
              </ProtectedRoute>
            } />

            <Route path="/cleaner/all-tasks" element={
              <ProtectedRoute allowedRoles={['CLEANER']}>
                <AllTasks />
              </ProtectedRoute>
            } />

            <Route path="/cleaner/history" element={
              <ProtectedRoute allowedRoles={['CLEANER']}>
                <MyHistory />
              </ProtectedRoute>
            } />

            <Route path="/cleaner/issues" element={
              <ProtectedRoute allowedRoles={['CLEANER']}>
                <ReportIssues />
              </ProtectedRoute>
            } />

            <Route path="/cleaner/stats" element={
              <ProtectedRoute allowedRoles={['CLEANER']}>
                <Statistics />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/bookings" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <BookingsManagement />
              </ProtectedRoute>
            } />

            <Route path="/admin/staff" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <StaffManagement />
              </ProtectedRoute>
            } />

            <Route path="/admin/maintenance" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Maintenance />
              </ProtectedRoute>
            } />

            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Reports />
              </ProtectedRoute>
            } />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
