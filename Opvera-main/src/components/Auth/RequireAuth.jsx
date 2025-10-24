import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const RequireAuth = ({ children, requiredRole = null }) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Check if user has required role
  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const roleRoutes = {
      student: '/dashboard/student',
      mentor: '/dashboard/mentor',
      company: '/dashboard/company',
      admin: '/admin'
    }

    const redirectTo = roleRoutes[profile?.role] || '/dashboard/student'
    return <Navigate to={redirectTo} replace />
  }

  // Check if mentor/company needs verification
  if ((profile?.role === 'mentor' || profile?.role === 'company') && !profile?.verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-white mb-4">Account Under Review</h2>
            <p className="text-gray-300 mb-6">
              Your {profile?.role} account is currently being reviewed by our admin team. 
              You'll receive an email notification once your account is approved.
            </p>
            <p className="text-sm text-gray-400">
              This process usually takes 1-2 business days.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default RequireAuth
