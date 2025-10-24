import React, { useState } from 'react';
import GlassCard from '../../../components/UI/GlassCard';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: [],
    experience: '',
    location: '',
    availability: ''
  });

  const candidates = [
    {
      id: 1,
      name: 'David Kim',
      avatar: '👨‍💼',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: '1 year',
      location: 'Los Angeles, CA',
      availability: 'Available',
      score: 85
    },
    {
      id: 2,
      name: 'Lisa Park',
      avatar: '👩‍💼',
      skills: ['Python', 'Django', 'PostgreSQL'],
      experience: '2 years',
      location: 'Chicago, IL',
      availability: 'Available',
      score: 78
    },
    {
      id: 3,
      name: 'James Wilson',
      avatar: '👨‍🎓',
      skills: ['Java', 'Spring', 'MySQL'],
      experience: '3 years',
      location: 'Boston, MA',
      availability: 'Busy',
      score: 82
    }
  ];

  const skillsOptions = ['React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'TypeScript', 'MongoDB', 'PostgreSQL', 'AWS'];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Search Candidates</h1>
        <p className="text-gray-300">Find the perfect match for your team</p>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-6 mb-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search by name or skills
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., React developer, Python expert..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skills
              </label>
              <select
                value={filters.skills}
                onChange={(e) => handleFilterChange('skills', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Skills</option>
                {skillsOptions.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Experience
              </label>
              <select
                value={filters.experience}
                onChange={(e) => handleFilterChange('experience', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Any Experience</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Any Status</option>
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-200">
              Search
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Search Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            Search Results ({candidates.length} candidates)
          </h2>
        </div>

        <div className="space-y-4">
          {candidates.map((candidate) => (
            <GlassCard key={candidate.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{candidate.avatar}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white">{candidate.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>📍 {candidate.location}</span>
                      <span>💼 {candidate.experience}</span>
                      <span>⭐ {candidate.score}% match</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-white/10 text-white text-xs rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-200">
                      Contact
                    </button>
                    <button className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
