import React from 'react';

const LeaderboardRow = ({ student, position }) => {
  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-400 bg-yellow-500/20';
      case 2: return 'text-gray-300 bg-gray-500/20';
      case 3: return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Expert': return 'text-purple-400 bg-purple-500/20';
      case 'Advanced': return 'text-blue-400 bg-blue-500/20';
      case 'Intermediate': return 'text-green-400 bg-green-500/20';
      case 'Beginner': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank;
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
      student.isCurrentUser 
        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50' 
        : 'bg-white/5 hover:bg-white/10'
    }`}>
      <div className="flex items-center space-x-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
          student.rank <= 3 ? getRankColor(student.rank) : 'text-gray-400 bg-gray-500/20'
        }`}>
          {student.rank <= 3 ? getRankIcon(student.rank) : student.rank}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">{student.avatar}</span>
          </div>
          
          <div>
            <h4 className={`font-medium ${student.isCurrentUser ? 'text-cyan-400' : 'text-white'}`}>
              {student.name}
            </h4>
            <div className="flex items-center space-x-2">
              {student.badges.map((badge, index) => (
                <span key={index} className="text-sm">{badge}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-center">
          <div className="text-white font-semibold">{student.score.toLocaleString()}</div>
          <div className="text-gray-400 text-xs">points</div>
        </div>
        
        <div className="text-center">
          <div className="text-white font-semibold">{student.projects}</div>
          <div className="text-gray-400 text-xs">projects</div>
        </div>
        
        <div className="text-center">
          <div className="text-white font-semibold">{student.quizzes}</div>
          <div className="text-gray-400 text-xs">quiz pts</div>
        </div>
        
        <div className="text-center">
          <div className="text-white font-semibold">{student.assignments}</div>
          <div className="text-gray-400 text-xs">assignments</div>
        </div>
        
        <div className="text-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(student.level)}`}>
            {student.level}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardRow;
