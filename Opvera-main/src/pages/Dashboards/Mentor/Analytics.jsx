import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import GlassCard from '../../../components/UI/GlassCard';
import { leaderboardApi, projectApi, assignmentApi, quizApi } from '../../../lib/api';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeProjects: 0,
    completedReviews: 0,
    avgResponseTime: 0
  });
  const [chartData, setChartData] = useState({
    studentActivity: [],
    quizScores: [],
    topSkills: [],
    projectStatus: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load leaderboard data for student activity
      const leaderboardData = await leaderboardApi.getLeaderboard(50);
      
      // Load projects data
      const projectsData = await projectApi.getAllProjects();
      
      // Load assignments data
      const assignmentsData = await assignmentApi.getAllAssignments();
      
      // Load quizzes data
      const quizzesData = await quizApi.getQuizzes();

      // Process data for charts
      const studentActivity = leaderboardData.slice(0, 10).map((student, index) => ({
        name: student.users?.display_name?.substring(0, 10) || `Student ${index + 1}`,
        points: student.total_points,
        projects: student.breakdown?.projects || 0,
        quizzes: student.breakdown?.quizzes || 0
      }));

      const quizScores = quizzesData.slice(0, 8).map(quiz => ({
        name: quiz.title.substring(0, 15),
        avgScore: Math.floor(Math.random() * 40) + 60, // Mock data for now
        attempts: Math.floor(Math.random() * 20) + 5
      }));

      // Extract top skills from all users
      const allSkills = {};
      leaderboardData.forEach(student => {
        if (student.users?.skills) {
          student.users.skills.forEach(skill => {
            allSkills[skill] = (allSkills[skill] || 0) + 1;
          });
        }
      });

      const topSkills = Object.entries(allSkills)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6)
        .map(([skill, count]) => ({
          name: skill,
          value: count
        }));

      const projectStatus = [
        { name: 'Verified', value: projectsData.filter(p => p.verified).length, color: '#10B981' },
        { name: 'Pending', value: projectsData.filter(p => !p.verified).length, color: '#F59E0B' },
        { name: 'In Progress', value: Math.floor(projectsData.length * 0.3), color: '#3B82F6' }
      ];

      setStats({
        totalStudents: leaderboardData.length,
        activeProjects: projectsData.length,
        completedReviews: projectsData.filter(p => p.verified).length + assignmentsData.filter(a => a.verified).length,
        avgResponseTime: 2.4
      });

      setChartData({
        studentActivity,
        quizScores,
        topSkills,
        projectStatus
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const recentActivity = [
    {
      id: 1,
      student: 'Alex Chen',
      action: 'submitted project for review',
      timestamp: '2 hours ago',
      type: 'submission'
    },
    {
      id: 2,
      student: 'Sarah Johnson',
      action: 'completed skill verification',
      timestamp: '4 hours ago',
      type: 'verification'
    },
    {
      id: 3,
      student: 'Mike Rodriguez',
      action: 'asked question in chat',
      timestamp: '6 hours ago',
      type: 'chat'
    },
    {
      id: 4,
      student: 'Emma Wilson',
      action: 'received project feedback',
      timestamp: '1 day ago',
      type: 'feedback'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'submission': return '📝';
      case 'verification': return '✅';
      case 'chat': return '💬';
      case 'feedback': return '💡';
      default: return '📄';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-300">Track your mentoring performance and student progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Students</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalStudents}</p>
              <p className="text-sm mt-1 text-green-400">+12% from last month</p>
            </div>
            <div className="text-3xl">👨‍🎓</div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Active Projects</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.activeProjects}</p>
              <p className="text-sm mt-1 text-green-400">+5% from last month</p>
            </div>
            <div className="text-3xl">🚀</div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Completed Reviews</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.completedReviews}</p>
              <p className="text-sm mt-1 text-green-400">+23% from last month</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Avg. Response Time</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.avgResponseTime}h</p>
              <p className="text-sm mt-1 text-green-400">-15% from last month</p>
            </div>
            <div className="text-3xl">⏱️</div>
          </div>
        </GlassCard>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Student Activity Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Students by Points</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.studentActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="points" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Quiz Scores Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Average Quiz Scores</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.quizScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Line type="monotone" dataKey="avgScore" stroke="#06B6D4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Skills</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.topSkills}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.topSkills.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Project Status Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Project Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.projectStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.projectStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Analytics;
