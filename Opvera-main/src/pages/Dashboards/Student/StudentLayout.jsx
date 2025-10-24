import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/UI/Navbar';
import Avatar from '../../components/UI/Avatar';

const StudentLayout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Feed', href: '/dashboard/student/feed', icon: '📰' },
    { name: 'Chat', href: '/dashboard/student/chat', icon: '💬' },
    { name: 'Tasks', href: '/dashboard/student/tasks', icon: '📋' },
    { name: 'Projects', href: '/dashboard/student/projects', icon: '🚀' },
    { name: 'Quizzes', href: '/dashboard/student/quizzes', icon: '📝' },
    { name: 'Leaderboard', href: '/dashboard/student/leaderboard', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <Avatar size="md" />
              <div>
                <h2 className="text-white font-semibold">Student Dashboard</h2>
                <p className="text-gray-300 text-sm">Welcome back!</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    location.pathname === item.href
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
