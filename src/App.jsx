import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initializeDatabase } from './utils/database';
import { initializeDummyData } from './utils/dummyData';

// Auth Pages
import LoginPage from './pages/LoginPage';

// Management Pages
import ManagementDashboard from './pages/Management/Dashboard';
import BranchManagement from './pages/Management/BranchManagement';
import StudentManagement from './pages/Management/StudentManagement';
import RoomManagement from './pages/Management/RoomManagement';
import PaymentManagement from './pages/Management/PaymentManagement';
import ComplaintManagement from './pages/Management/ComplaintManagement';
import PollManagement from './pages/Management/PollManagement';
import AlertManagement from './pages/Management/AlertManagement';
import LeaveRequestManagement from './pages/Management/LeaveRequestManagement';

// Student Pages
import StudentDashboard from './pages/Student/Dashboard';
import StudentProfile from './pages/Student/Profile';
import StudentPayment from './pages/Student/Payment';
import StudentComplaints from './pages/Student/Complaints';
import StudentPolls from './pages/Student/Polls';
import StudentAlerts from './pages/Student/Alerts';
import StudentLeaveRequest from './pages/Student/LeaveRequest';

// Protected Route Component
const ProtectedRoute = ({ children, allowedType }) => {
  const { isAuthenticated, userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedType && userType !== allowedType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated, userType } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            userType === 'management' ? (
              <Navigate to="/management/dashboard" replace />
            ) : (
              <Navigate to="/student/dashboard" replace />
            )
          ) : (
            <LoginPage />
          )
        } 
      />

      {/* Management Routes */}
      <Route
        path="/management/dashboard"
        element={
          <ProtectedRoute allowedType="management">
            <ManagementDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/branches"
        element={
          <ProtectedRoute allowedType="management">
            <BranchManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/students"
        element={
          <ProtectedRoute allowedType="management">
            <StudentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/rooms"
        element={
          <ProtectedRoute allowedType="management">
            <RoomManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/payments"
        element={
          <ProtectedRoute allowedType="management">
            <PaymentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/complaints"
        element={
          <ProtectedRoute allowedType="management">
            <ComplaintManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/polls"
        element={
          <ProtectedRoute allowedType="management">
            <PollManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/alerts"
        element={
          <ProtectedRoute allowedType="management">
            <AlertManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/leave-requests"
        element={
          <ProtectedRoute allowedType="management">
            <LeaveRequestManagement />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedType="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedType="student">
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/payment"
        element={
          <ProtectedRoute allowedType="student">
            <StudentPayment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/complaints"
        element={
          <ProtectedRoute allowedType="student">
            <StudentComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/polls"
        element={
          <ProtectedRoute allowedType="student">
            <StudentPolls />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/alerts"
        element={
          <ProtectedRoute allowedType="student">
            <StudentAlerts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/leave-request"
        element={
          <ProtectedRoute allowedType="student">
            <StudentLeaveRequest />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Initialize database and dummy data on first load
    initializeDatabase();
    initializeDummyData();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
