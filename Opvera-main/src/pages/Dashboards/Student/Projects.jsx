import React, { useState, useEffect } from 'react';
import GlassCard from '../../../components/UI/GlassCard';
import ProjectSubmissionModal from '../../../components/Projects/ProjectSubmissionModal';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { getPublicUrl } from '../../../lib/storage';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (verified) => {
    if (verified) return 'text-green-400 bg-green-500/20';
    return 'text-yellow-400 bg-yellow-500/20';
  };

  const getStatusText = (verified) => {
    return verified ? 'verified' : 'pending review';
  };

  const handleSubmitProject = (projectId = null) => {
    setSelectedProjectId(projectId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProjectId(null);
    fetchProjects(); // Refresh projects list
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-gray-300">Loading your projects...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-gray-300">Track your project progress and collaborate with mentors</p>
        </div>
        <button
          onClick={() => handleSubmitProject()}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
        >
          Submit New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
          <p className="text-gray-400 mb-6">Start building your portfolio by submitting your first project!</p>
          <button
            onClick={() => handleSubmitProject()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
          >
            Submit Your First Project
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <GlassCard key={project.id} className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.verified)}`}>
                    {getStatusText(project.verified)}
                  </span>
                </div>
                
                <p className="text-gray-300 mb-4">{project.description}</p>
                
                {/* GitHub Link */}
                {project.github_url && (
                  <div className="mb-4">
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      View on GitHub
                    </a>
                  </div>
                )}
                
                {/* Files */}
                {project.files && project.files.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Project Files:</h4>
                    <div className="space-y-1">
                      {project.files.map((filePath, index) => {
                        const fileName = filePath.split('/').pop();
                        const publicUrl = getPublicUrl('projects', filePath);
                        return (
                          <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm">📁</div>
                              <span className="text-white text-sm">{fileName}</span>
                            </div>
                            <a
                              href={publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 text-sm"
                            >
                              Download
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-white/10 text-white text-xs rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span>⭐</span>
                    <span>Points: {project.points_awarded}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📅</span>
                    <span>Submitted: {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleSubmitProject(project.id)}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
                >
                  Update Project
                </button>
                {project.mentor_notes && (
                  <button className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200">
                    View Feedback
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <ProjectSubmissionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        projectId={selectedProjectId}
      />
    </div>
  );
};

export default Projects;
