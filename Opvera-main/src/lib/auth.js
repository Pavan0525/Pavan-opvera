import { supabase } from './supabaseClient';

// Role-based route guard
export const requireAuth = (requiredRole = null) => {
  return async (to, from, next) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // Redirect to login if not authenticated
        next('/auth/login');
        return;
      }

      if (requiredRole) {
        // Get user profile to check role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile || profile.role !== requiredRole) {
          // Redirect to appropriate dashboard or show error
          next('/dashboard/unauthorized');
          return;
        }
      }

      next();
    } catch (error) {
      console.error('Auth guard error:', error);
      next('/auth/login');
    }
  };
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

// Get current user role
export const getCurrentUserRole = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    return profile?.role || null;
  } catch (error) {
    console.error('Role check error:', error);
    return null;
  }
};

// Redirect to appropriate dashboard based on role
export const redirectToDashboard = async (navigate) => {
  try {
    const role = await getCurrentUserRole();
    if (role) {
      navigate(`/dashboard/${role}`);
    } else {
      navigate('/dashboard/student'); // Default fallback
    }
  } catch (error) {
    console.error('Dashboard redirect error:', error);
    navigate('/auth/login');
  }
};

// Auth state management
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};

// Permission helpers
export const hasPermission = (userRole, requiredPermissions) => {
  const rolePermissions = {
    student: ['view_profile', 'submit_projects', 'take_quizzes', 'chat'],
    mentor: ['view_profile', 'review_projects', 'verify_skills', 'chat', 'view_analytics'],
    company: ['view_profiles', 'search_talent', 'contact_users'],
    admin: ['manage_users', 'view_analytics', 'system_settings', 'all']
  };

  const userPermissions = rolePermissions[userRole] || [];
  
  if (Array.isArray(requiredPermissions)) {
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission) || userPermissions.includes('all')
    );
  }
  
  return userPermissions.includes(requiredPermissions) || userPermissions.includes('all');
};

// Route protection component
export const ProtectedRoute = ({ children, requiredRole, requiredPermissions }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth/login');
        return;
      }

      if (requiredRole && user.user_metadata?.role !== requiredRole) {
        navigate('/dashboard/unauthorized');
        return;
      }

      if (requiredPermissions && !hasPermission(user.user_metadata?.role, requiredPermissions)) {
        navigate('/dashboard/unauthorized');
        return;
      }
    }
  }, [user, loading, navigate, requiredRole, requiredPermissions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
};

export default {
  requireAuth,
  isAuthenticated,
  getCurrentUserRole,
  redirectToDashboard,
  useAuth,
  hasPermission,
  ProtectedRoute
};
