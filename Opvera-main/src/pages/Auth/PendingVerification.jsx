import React from 'react'
import { Link } from 'react-router-dom'
import GlassCard from '../../components/UI/GlassCard'
import Navbar from '../../components/UI/Navbar'
import { useAuth } from '../../contexts/AuthContext'

const PendingVerification = () => {
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <GlassCard className="p-8 text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">⏳</div>
              <h1 className="text-3xl font-bold text-white mb-4">Account Under Review</h1>
              <p className="text-gray-300 text-lg">
                Your {profile?.role} account is currently being reviewed by our admin team.
              </p>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-300 mb-3">What happens next?</h2>
              <ul className="text-left text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  Our admin team will review your submitted documents
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  Verification typically takes 1-2 business days
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  You'll receive an email notification once approved
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  You can then access your dashboard and start using the platform
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <p className="text-gray-400">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@opvera.com" className="text-cyan-400 hover:text-cyan-300">
                  support@opvera.com
                </a>
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleSignOut}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Sign Out
                </button>
                <Link
                  to="/auth/login"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default PendingVerification
