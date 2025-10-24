import React, { useState, useEffect } from 'react';
import { Search, Filter, Trophy, Star, Zap, Target } from 'lucide-react';
import GlassCard from '../../../components/UI/GlassCard';
import LeaderboardList from '../../../components/Leaderboard/LeaderboardList';
import { leaderboardApi } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuth();

  const categories = [
    { name: 'Overall', active: true, key: 'overall' },
    { name: 'Projects', active: false, key: 'projects' },
    { name: 'Quizzes', active: false, key: 'quizzes' },
    { name: 'Assignments', active: false, key: 'assignments' },
    { name: 'Challenges', active: false, key: 'challenges' }
  ];

  const [activeCategory, setActiveCategory] = useState('overall');

  const skills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'Machine Learning',
    'Data Science', 'Web Development', 'Mobile Development', 'DevOps', 'UI/UX'
  ];

  const loadLeaderboard = async (page = 0, skill = '', search = '') => {
    try {
      setLoading(true);
      let data;
      
      if (search) {
        data = await leaderboardApi.searchLeaderboard(search, 50);
      } else if (skill) {
        data = await leaderboardApi.getLeaderboardBySkill(skill, 50, page * 50);
      } else {
        data = await leaderboardApi.getLeaderboard(50, page * 50);
      }

      // Transform data to match component expectations
      const transformedData = data.map((item, index) => ({
        rank: item.rank || (page * 50 + index + 1),
        name: item.users.display_name,
        avatar: item.users.avatar_url || '👤',
        score: item.total_points,
        breakdown: item.breakdown,
        badges: generateBadges(item.total_points, item.breakdown),
        level: calculateLevel(item.total_points),
        projects: item.breakdown?.projects || 0,
        quizzes: item.breakdown?.quizzes || 0,
        assignments: item.breakdown?.assignments || 0,
        challenges: item.breakdown?.challenges || 0,
        skills: item.users.skills || [],
        isCurrentUser: item.user_id === user?.id
      }));

      setLeaderboardData(transformedData);
      setTotalPages(Math.ceil(data.length / 50));
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUserRank = async () => {
    if (!user?.id) return;
    
    try {
      const userRank = await leaderboardApi.getUserRank(user.id);
      if (userRank) {
        setCurrentUserRank({
          rank: userRank.rank,
          score: userRank.total_points,
          breakdown: userRank.breakdown
        });
      }
    } catch (error) {
      console.error('Error loading user rank:', error);
    }
  };

  const generateBadges = (totalPoints, breakdown) => {
    const badges = [];
    
    if (totalPoints >= 2000) badges.push('🏆');
    if (totalPoints >= 1000) badges.push('⭐');
    if (breakdown?.projects >= 10) badges.push('🔥');
    if (breakdown?.quizzes >= 50) badges.push('🎯');
    if (breakdown?.assignments >= 20) badges.push('📚');
    
    return badges;
  };

  const calculateLevel = (totalPoints) => {
    if (totalPoints >= 2000) return 'Expert';
    if (totalPoints >= 1000) return 'Advanced';
    if (totalPoints >= 500) return 'Intermediate';
    return 'Beginner';
  };

  useEffect(() => {
    loadLeaderboard(currentPage, selectedSkill, searchQuery);
    loadCurrentUserRank();
  }, [currentPage, selectedSkill, searchQuery, user?.id]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const handleSkillFilter = (skill) => {
    setSelectedSkill(skill === selectedSkill ? '' : skill);
    setCurrentPage(0);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    // Filter data based on category
    // This could be enhanced to show different views
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
        <p className="text-gray-300">See how you rank among your peers</p>
      </div>

      {/* Search and Filter Bar */}
      <GlassCard className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Skill Filter */}
          <div className="flex-1">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedSkill}
                onChange={(e) => handleSkillFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">All Skills</option>
                {skills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => handleCategoryChange(category.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeCategory === category.key
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Your Current Position */}
      {currentUserRank && (
        <GlassCard className="p-6 mb-6">
          <div className="text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              You're Ranked #{currentUserRank.rank}
            </h2>
            <p className="text-gray-300 mb-4">
              {currentUserRank.rank <= 10 
                ? "Excellent work! You're in the top 10!" 
                : currentUserRank.rank <= 50
                ? "Great progress! Keep climbing the leaderboard."
                : "Keep learning and earning points to climb higher!"
              }
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-white font-semibold">{currentUserRank.score.toLocaleString()}</div>
                <div className="text-gray-400">Points</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">{currentUserRank.breakdown?.projects || 0}</div>
                <div className="text-gray-400">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">{currentUserRank.breakdown?.quizzes || 0}</div>
                <div className="text-gray-400">Quiz Points</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">{currentUserRank.breakdown?.assignments || 0}</div>
                <div className="text-gray-400">Assignments</div>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Leaderboard */}
      <GlassCard className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading leaderboard...</p>
          </div>
        ) : (
          <>
            <LeaderboardList data={leaderboardData} />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-gray-300">
                  Page {currentPage + 1} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  );
};

export default Leaderboard;
