import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import GlassCard from '../../components/UI/GlassCard';
import Navbar from '../../components/UI/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { validateLoginForm } from '../../lib/validation';
import { useToast } from '../../components/UI/ToastProvider';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { success, error } = useToast();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getRoleRedirectPath = (role) => {
    const roleRoutes = {
      student: '/dashboard/student',
      mentor: '/dashboard/mentor',
      company: '/dashboard/company',
      admin: '/admin'
    };
    return roleRoutes[role] || '/dashboard/student';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate form data
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    const sanitizedData = validation.sanitizedData;

    try {
      const { data, error } = await signIn(sanitizedData.email, sanitizedData.password);

      if (error) {
        throw error;
      }

      if (data.user) {
        // Fetch user profile to get role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, verified')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw new Error('Failed to fetch user profile');
        }

        // Check if mentor/company needs verification
        if ((profile.role === 'mentor' || profile.role === 'company') && !profile.verified) {
          navigate('/auth/pending-verification');
          return;
        }

        // Redirect based on role
        const redirectPath = getRoleRedirectPath(profile.role);
        navigate(redirectPath, { replace: true });
        success('Login successful!');
      }
    } catch (err) {
      console.error('Login error:', err);
      error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
              <p className="text-gray-300">Welcome back to Opvera</p>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
                <div className="font-medium mb-2">Please fix the following errors:</div>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-cyan-500 bg-white/10 border-white/20 rounded focus:ring-cyan-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Login'}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-300">
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                  Get Started
                </Link>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Login;
