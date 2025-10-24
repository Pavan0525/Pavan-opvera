import React from 'react';
import GlassCard from '../../../components/UI/GlassCard';

const Feed = () => {
  const feedItems = [
    {
      id: 1,
      type: 'announcement',
      title: 'New Project Available: React Portfolio',
      content: 'Build a stunning portfolio website using React and showcase your skills to potential employers.',
      author: 'Tech Mentor',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Congratulations! You completed JavaScript Fundamentals',
      content: 'You\'ve successfully completed the JavaScript Fundamentals course with a score of 95%.',
      author: 'System',
      timestamp: '1 day ago',
      likes: 12,
      comments: 3
    },
    {
      id: 3,
      type: 'project',
      title: 'Project Submission: E-commerce Website',
      content: 'Your e-commerce website project has been reviewed and approved by your mentor.',
      author: 'Sarah Johnson',
      timestamp: '3 days ago',
      likes: 18,
      comments: 5
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Activity Feed</h1>
        <p className="text-gray-300">Stay updated with the latest announcements and achievements</p>
      </div>

      <div className="space-y-6">
        {feedItems.map((item) => (
          <GlassCard key={item.id} className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {item.type === 'announcement' ? '📢' : 
                   item.type === 'achievement' ? '🏆' : '🚀'}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <span className="text-xs text-gray-400">{item.timestamp}</span>
                </div>
                
                <p className="text-gray-300 mb-4">{item.content}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center space-x-1">
                    <span>👍</span>
                    <span>{item.likes}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>💬</span>
                    <span>{item.comments}</span>
                  </span>
                  <span>by {item.author}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Feed;
