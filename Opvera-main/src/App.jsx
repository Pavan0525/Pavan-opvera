import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';

// Context
import { AuthProvider } from './contexts/AuthContext';
import ToastProvider from './components/UI/ToastProvider';

// Components
import ErrorBoundary from './components/UI/ErrorBoundary';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import PendingVerification from './pages/Auth/PendingVerification';

// Dashboard Layouts
import StudentLayout from './pages/Dashboards/Student/StudentLayout';
import MentorLayout from './pages/Dashboards/Mentor/MentorLayout';
import CompanyLayout from './pages/Dashboards/Company/CompanyLayout';

// Student Dashboard Pages
import Feed from './pages/Dashboards/Student/Feed';
import Chat from './pages/Dashboards/Student/Chat';
import Tasks from './pages/Dashboards/Student/Tasks';
import Projects from './pages/Dashboards/Student/Projects';
import Quizzes from './pages/Dashboards/Student/Quizzes';
import Leaderboard from './pages/Dashboards/Student/Leaderboard';

// Mentor Dashboard Pages
import Submissions from './pages/Dashboards/Mentor/Submissions';
import Verify from './pages/Dashboards/Mentor/Verify';
import Chats from './pages/Dashboards/Mentor/Chats';
import Analytics from './pages/Dashboards/Mentor/Analytics';

// Company Dashboard Pages
import TopTalent from './pages/Dashboards/Company/TopTalent';
import Search from './pages/Dashboards/Company/Search';
import Contact from './pages/Dashboards/Company/Contact';

// Admin Dashboard
import AdminPanel from './pages/Dashboards/Admin/AdminPanel';

// Auth Guard
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/pending-verification" element={<PendingVerification />} />
                
                {/* Student Dashboard Routes */}
                <Route path="/dashboard/student" element={
                  <ProtectedRoute requiredRole="student">
                    <StudentLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard/student/feed" replace />} />
                  <Route path="feed" element={<Feed />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="quizzes" element={<Quizzes />} />
                  <Route path="leaderboard" element={<Leaderboard />} />
                </Route>
                
                {/* Mentor Dashboard Routes */}
                <Route path="/dashboard/mentor" element={
                  <ProtectedRoute requiredRole="mentor">
                    <MentorLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard/mentor/submissions" replace />} />
                  <Route path="submissions" element={<Submissions />} />
                  <Route path="verify" element={<Verify />} />
                  <Route path="chats" element={<Chats />} />
                  <Route path="analytics" element={<Analytics />} />
                </Route>
                
                {/* Company Dashboard Routes */}
                <Route path="/dashboard/company" element={
                  <ProtectedRoute requiredRole="company">
                    <CompanyLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard/company/top-talent" replace />} />
                  <Route path="top-talent" element={<TopTalent />} />
                  <Route path="search" element={<Search />} />
                  <Route path="contact" element={<Contact />} />
                </Route>
                
                {/* Admin Dashboard Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                
                {/* Fallback Routes */}
                <Route path="/dashboard" element={<Navigate to="/dashboard/student" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App
