import React, { useState } from 'react';
import GlassCard from '../../../components/UI/GlassCard';

const Tasks = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Complete React Fundamentals Quiz',
      description: 'Take the quiz covering React basics, hooks, and state management',
      dueDate: '2024-01-15',
      priority: 'high',
      status: 'pending',
      category: 'Quiz'
    },
    {
      id: 2,
      title: 'Submit Portfolio Project',
      description: 'Upload your completed portfolio website project',
      dueDate: '2024-01-20',
      priority: 'medium',
      status: 'in-progress',
      category: 'Project'
    },
    {
      id: 3,
      title: 'Read JavaScript ES6+ Guide',
      description: 'Study the provided materials on modern JavaScript features',
      dueDate: '2024-01-18',
      priority: 'low',
      status: 'completed',
      category: 'Reading'
    }
  ]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'in-progress': return 'text-blue-400 bg-blue-500/20';
      case 'pending': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const toggleTaskStatus = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
        : task
    ));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tasks</h1>
        <p className="text-gray-300">Manage your assignments and track your progress</p>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <GlassCard key={task.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                
                <p className="text-gray-300 mb-3">{task.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  <span>📂 {task.category}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    task.status === 'completed'
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                  }`}
                >
                  {task.status === 'completed' ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
