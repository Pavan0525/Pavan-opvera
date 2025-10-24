import { useAuth } from '../contexts/AuthContext'

export const useRole = () => {
  const { profile, user } = useAuth()

  const hasRole = (requiredRole) => {
    return profile?.role === requiredRole
  }

  const hasAnyRole = (roles) => {
    return roles.includes(profile?.role)
  }

  const isAdmin = () => hasRole('admin')
  const isMentor = () => hasRole('mentor')
  const isStudent = () => hasRole('student')
  const isCompany = () => hasRole('company')

  const isVerified = () => {
    // Students are always considered verified
    if (profile?.role === 'student') return true
    return profile?.verified === true
  }

  const canAccess = (resource) => {
    if (!profile) return false

    const permissions = {
      admin: ['all'],
      mentor: ['dashboard', 'chats', 'analytics', 'verify'],
      student: ['dashboard', 'projects', 'quizzes', 'leaderboard', 'chat'],
      company: ['dashboard', 'search', 'contact', 'talent']
    }

    const userPermissions = permissions[profile.role] || []
    return userPermissions.includes('all') || userPermissions.includes(resource)
  }

  return {
    role: profile?.role,
    profile,
    user,
    hasRole,
    hasAnyRole,
    isAdmin,
    isMentor,
    isStudent,
    isCompany,
    isVerified,
    canAccess
  }
}
