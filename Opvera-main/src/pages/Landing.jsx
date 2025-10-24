import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/UI/GlassCard';
import Navbar from '../components/UI/Navbar';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Opvera</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The ultimate platform connecting students, mentors, and companies for collaborative learning and growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/auth/login" 
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
            >
              Login
            </Link>
            <Link 
              to="/auth/register" 
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <GlassCard className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">For Students</h3>
              <p className="text-gray-300">Access projects, quizzes, and connect with mentors to accelerate your learning journey.</p>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">For Mentors</h3>
              <p className="text-gray-300">Guide students, review submissions, and track progress through our comprehensive dashboard.</p>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">For Companies</h3>
              <p className="text-gray-300">Discover top talent, collaborate on projects, and build meaningful connections.</p>
            </div>
          </GlassCard>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <GlassCard className="p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-6">Join thousands of students, mentors, and companies already using Opvera.</p>
            <Link 
              to="/auth/register" 
              className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
            >
              Get Started
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Landing;
