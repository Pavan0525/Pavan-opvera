import React from 'react';
import LeaderboardRow from './LeaderboardRow';

const LeaderboardList = ({ data }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 font-medium w-8">Rank</span>
          <span className="text-gray-400 font-medium">Student</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 font-medium">Score</span>
          <span className="text-gray-400 font-medium">Projects</span>
          <span className="text-gray-400 font-medium">Quiz Pts</span>
          <span className="text-gray-400 font-medium">Assignments</span>
          <span className="text-gray-400 font-medium">Level</span>
        </div>
      </div>

      {/* Rows */}
      {data.map((student, index) => (
        <LeaderboardRow
          key={student.rank}
          student={student}
          position={index}
        />
      ))}
    </div>
  );
};

export default LeaderboardList;
