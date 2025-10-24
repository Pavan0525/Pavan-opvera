import React, { useState } from 'react';
import GlassCard from '../../../components/UI/GlassCard';

const Verify = () => {
  const [verifications] = useState([
    {
      id: 1,
      student: 'Emma Wilson',
      skill: 'React Development',
      evidence: 'Portfolio with 5 React projects',
      status: 'pending',
      submittedAt: '2024-01-14T14:20:00Z',
      level: 'Intermediate'
    },
    {
      id: 2,
      student: 'David Kim',
      skill: 'JavaScript Fundamentals',
      evidence: 'Completed JavaScript course with 95% score',
      status: 'verified',
      submittedAt: '2024-01-13T11:30:00Z',
      level: 'Beginner'
    },
    {
      id: 3,
      student: 'Lisa Park',
      skill: 'Node.js Backend',
      evidence: 'Built REST API with authentication',
      status: 'rejected',
      submittedAt: '2024-01-12T16:45:00Z',
      level: 'Advanced'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'verified': return 'text-green-400 bg-green-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'text-green-400 bg-green-500/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'Advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleVerification = (id, action) => {
    console.log(`Verification ${action} for submission ${id}`);
    // TODO: Implement verification logic
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Skill Verification</h1>
        <p className="text-gray-300">Verify student skills and competencies</p>
      </div>

      <div className="space-y-6">
        {verifications.map((verification) => (
          <GlassCard key={verification.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🎓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{verification.skill}</h3>
                    <p className="text-gray-300">by {verification.student}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verification.status)}`}>
                    {verification.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(verification.level)}`}>
                    {verification.level}
                  </span>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Evidence:</h4>
                  <p className="text-gray-300">{verification.evidence}</p>
                </div>
                
                <div className="text-sm text-gray-400">
                  <span>📅 Submitted: {new Date(verification.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 ml-6">
                {verification.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleVerification(verification.id, 'verify')}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-200"
                    >
                      Verify
                    </button>
                    <button 
                      onClick={() => handleVerification(verification.id, 'reject')}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-all duration-200"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200">
                  View Details
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Verify;
