import React from 'react';
import GlassCard from '../../../components/UI/GlassCard';

const TopTalent = () => {
  const topTalent = [
    {
      id: 1,
      name: 'Alex Chen',
      avatar: '👨‍💻',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      experience: '2 years',
      projects: 12,
      score: 95,
      location: 'San Francisco, CA',
      availability: 'Available',
      portfolio: 'https://alexchen.dev'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      avatar: '👩‍💻',
      skills: ['Vue.js', 'Python', 'Django', 'PostgreSQL'],
      experience: '1.5 years',
      projects: 10,
      score: 92,
      location: 'New York, NY',
      availability: 'Available',
      portfolio: 'https://sarahjohnson.dev'
    },
    {
      id: 3,
      name: 'Mike Rodriguez',
      avatar: '👨‍🎓',
      skills: ['Angular', 'Java', 'Spring Boot', 'MySQL'],
      experience: '3 years',
      projects: 15,
      score: 88,
      location: 'Austin, TX',
      availability: 'Busy',
      portfolio: 'https://mikerodriguez.dev'
    },
    {
      id: 4,
      name: 'Emma Wilson',
      avatar: '👩‍🎓',
      skills: ['React Native', 'Flutter', 'Firebase', 'AWS'],
      experience: '2.5 years',
      projects: 11,
      score: 90,
      location: 'Seattle, WA',
      availability: 'Available',
      portfolio: 'https://emmawilson.dev'
    }
  ];

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available': return 'text-green-400 bg-green-500/20';
      case 'Busy': return 'text-yellow-400 bg-yellow-500/20';
      case 'Unavailable': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Top Talent</h1>
        <p className="text-gray-300">Discover the best developers and connect with them</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topTalent.map((talent) => (
          <GlassCard key={talent.id} className="p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">{talent.avatar}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-white">{talent.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(talent.availability)}`}>
                    {talent.availability}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                  <span>📍 {talent.location}</span>
                  <span>💼 {talent.experience}</span>
                  <span>🚀 {talent.projects} projects</span>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Overall Score</span>
                    <span>{talent.score}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-teal-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${talent.score}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {talent.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-white/10 text-white text-xs rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-200">
                Contact
              </button>
              <button className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200">
                View Portfolio
              </button>
              <button className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200">
                Save
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default TopTalent;
