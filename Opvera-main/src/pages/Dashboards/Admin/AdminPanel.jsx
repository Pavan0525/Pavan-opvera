import React, { useState, useEffect } from 'react';
import { Search, Users, MessageSquare, Trash2, Ban, Shield, Settings, Eye, Edit, AlertTriangle } from 'lucide-react';
import GlassCard from '../../../components/UI/GlassCard';
import AdminChatManagement from '../../../components/Chat/AdminChatManagement';
import { adminApi, userApi, projectApi, assignmentApi, chatApi } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    completedQuizzes: 0,
    systemHealth: '99.9%'
  });
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const systemStats = await adminApi.getSystemStats();
      setStats({
        totalUsers: systemStats.totalUsers,
        activeProjects: systemStats.totalProjects || 0,
        completedQuizzes: systemStats.totalQuizzes || 0,
        systemHealth: '99.9%'
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const performGlobalSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      
      // Search across multiple entities
      const [usersResult, projectsResult, assignmentsResult, messagesResult] = await Promise.all([
        adminApi.searchUsers(query),
        projectApi.searchProjects(query),
        assignmentApi.searchAssignments(query),
        chatApi.searchMessages(query)
      ]);

      const results = [
        ...usersResult.map(item => ({ ...item, type: 'user' })),
        ...projectsResult.map(item => ({ ...item, type: 'project' })),
        ...assignmentsResult.map(item => ({ ...item, type: 'assignment' })),
        ...messagesResult.map(item => ({ ...item, type: 'message' }))
      ];

      setSearchResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    performGlobalSearch(query);
  };

  const banUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to ban ${userEmail}?`)) return;

    try {
      await adminApi.banUser(userId);
      alert('User has been banned');
      performGlobalSearch(searchQuery); // Refresh search results
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    }
  };

  const kickUserFromChannel = async (userId, channelId, channelName) => {
    if (!window.confirm(`Are you sure you want to kick this user from ${channelName}?`)) return;

    try {
      await adminApi.kickUserFromChannel(userId, channelId);
      alert('User has been kicked from channel');
      performGlobalSearch(searchQuery); // Refresh search results
    } catch (error) {
      console.error('Error kicking user:', error);
      alert('Failed to kick user from channel');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await adminApi.deleteMessage(messageId);
      alert('Message has been deleted');
      performGlobalSearch(searchQuery); // Refresh search results
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const deleteChannel = async (channelId, channelName) => {
    if (!window.confirm(`Are you sure you want to delete the channel "${channelName}"?`)) return;

    try {
      await adminApi.deleteChannel(channelId);
      alert('Channel has been deleted');
      performGlobalSearch(searchQuery); // Refresh search results
    } catch (error) {
      console.error('Error deleting channel:', error);
      alert('Failed to delete channel');
    }
  };

  const getSearchResultIcon = (type) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'project': return <Shield className="w-4 h-4" />;
      case 'assignment': return <Edit className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getSearchResultColor = (type) => {
    switch (type) {
      case 'user': return 'text-blue-400';
      case 'project': return 'text-green-400';
      case 'assignment': return 'text-purple-400';
      case 'message': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const stats = [
    {
      title: 'Total Users',
      value: '1,247',
      change: '+15%',
      changeType: 'positive',
      icon: '👥'
    },
    {
      title: 'Active Projects',
      value: '89',
      change: '+8%',
      changeType: 'positive',
      icon: '🚀'
    },
    {
      title: 'Completed Quizzes',
      value: '2,156',
      change: '+23%',
      changeType: 'positive',
      icon: '📝'
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: '+0.1%',
      changeType: 'positive',
      icon: '💚'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'Alex Chen',
      action: 'completed React Fundamentals quiz',
      timestamp: '2 hours ago',
      type: 'quiz'
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      action: 'submitted portfolio project',
      timestamp: '4 hours ago',
      type: 'project'
    },
    {
      id: 3,
      user: 'Mike Rodriguez',
      action: 'verified JavaScript skills',
      timestamp: '6 hours ago',
      type: 'verification'
    },
    {
      id: 4,
      user: 'Emma Wilson',
      action: 'joined as new student',
      timestamp: '1 day ago',
      type: 'registration'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quiz': return '📝';
      case 'project': return '🚀';
      case 'verification': return '✅';
      case 'registration': return '👤';
      default: return '📄';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'search', name: 'Global Search', icon: '🔍' },
    { id: 'chat', name: 'Chat Management', icon: '💬' },
    { id: 'users', name: 'User Management', icon: '👥' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <div className="space-y-6">
            {/* Global Search */}
            <GlassCard className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Global Search</h3>
                <p className="text-gray-300">Search across users, messages, projects, and assignments</p>
              </div>
              
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search users, messages, projects..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Search Results ({searchResults.length})</h4>
                  {searchResults.map((result, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`${getSearchResultColor(result.type)} mt-1`}>
                            {getSearchResultIcon(result.type)}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-white font-medium capitalize">
                              {result.type}: {result.title || result.display_name || result.content?.substring(0, 50)}
                            </h5>
                            <p className="text-gray-300 text-sm mt-1">
                              {result.description || result.email || result.content}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                              <span>ID: {result.id}</span>
                              {result.created_at && <span>Created: {new Date(result.created_at).toLocaleDateString()}</span>}
                              {result.role && <span>Role: {result.role}</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {result.type === 'user' && result.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => banUser(result.id, result.email)}
                                className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                title="Ban user"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => kickUserFromChannel(result.id, result.channel_id, result.channel_name)}
                                className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded transition-colors"
                                title="Kick from channel"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {result.type === 'message' && (
                            <button
                              onClick={() => deleteMessage(result.id)}
                              className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                              title="Delete message"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {result.type === 'channel' && (
                            <button
                              onClick={() => deleteChannel(result.id, result.name)}
                              className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                              title="Delete channel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        );
      case 'chat':
        return <AdminChatManagement />;
      case 'users':
        return (
          <div className="text-center text-gray-400 py-8">
            <h2 className="text-xl font-semibold mb-2">User Management</h2>
            <p>User management features coming soon...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="text-center text-gray-400 py-8">
            <h2 className="text-xl font-semibold mb-2">Analytics</h2>
            <p>Analytics dashboard coming soon...</p>
          </div>
        );
      default:
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</p>
                    <p className="text-sm mt-1 text-green-400">+15% from last month</p>
                  </div>
                  <div className="text-3xl">👥</div>
                </div>
              </GlassCard>
              
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Active Projects</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.activeProjects}</p>
                    <p className="text-sm mt-1 text-green-400">+8% from last month</p>
                  </div>
                  <div className="text-3xl">🚀</div>
                </div>
              </GlassCard>
              
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Completed Quizzes</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.completedQuizzes}</p>
                    <p className="text-sm mt-1 text-green-400">+23% from last month</p>
                  </div>
                  <div className="text-3xl">📝</div>
                </div>
              </GlassCard>
              
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">System Health</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.systemHealth}</p>
                    <p className="text-sm mt-1 text-green-400">+0.1% from last month</p>
                  </div>
                  <div className="text-3xl">💚</div>
                </div>
              </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <span className="text-sm">{getActivityIcon(activity.type)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* System Status */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Database</span>
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">API Server</span>
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">File Storage</span>
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Email Service</span>
                    <span className="text-yellow-400 flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      Maintenance
                    </span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Quick Actions */}
            <GlassCard className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('users')}
                  className="p-4 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
                >
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-medium">Manage Users</div>
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="p-4 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium">View Analytics</div>
                </button>
                <button className="p-4 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all duration-200">
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="font-medium">System Settings</div>
                </button>
              </div>
            </GlassCard>
          </>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-gray-300">Monitor system performance and user activity</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-white/10 backdrop-blur-lg rounded-lg p-1 border border-white/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default AdminPanel;
