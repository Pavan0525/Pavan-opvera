import React from 'react'
import { Navigate } from 'react-router-dom'
import RequireAuth from './RequireAuth'
import { useRole } from '../hooks/useRole'

const RoleRoute = ({ children, allowedRoles, fallbackPath = null }) => {
  const { role, isVerified } = useRole()

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(role)

  if (!hasRequiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const roleRoutes = {
      student: '/dashboard/student',
      mentor: '/dashboard/mentor',
      company: '/dashboard/company',
      admin: '/admin'
    }

    const redirectTo = fallbackPath || roleRoutes[role] || '/dashboard/student'
    return <Navigate to={redirectTo} replace />
  }

  // Check verification for mentors/companies
  if ((role === 'mentor' || role === 'company') && !isVerified()) {
    return <Navigate to="/auth/pending-verification" replace />
  }

  return children
}

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = null }) => {
  // If specific role is required
  if (requiredRole) {
    return (
      <RequireAuth requiredRole={requiredRole}>
        {children}
      </RequireAuth>
    )
  }

  // If multiple roles are allowed
  if (allowedRoles) {
    return (
      <RequireAuth>
        <RoleRoute allowedRoles={allowedRoles}>
          {children}
        </RoleRoute>
      </RequireAuth>
    )
  }

  // Just require authentication
  return (
    <RequireAuth>
      {children}
    </RequireAuth>
  )
}

export default ProtectedRoute
export { RoleRoute }
