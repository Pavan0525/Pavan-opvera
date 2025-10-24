import React, { useState } from 'react';
import { uploadFile, generateProjectPath, getPublicUrl } from '../../lib/storage';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const ProjectSubmissionModal = ({ isOpen, onClose, projectId }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    github_url: '',
    tags: []
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Validate files
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
      'application/json',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    for (const file of selectedFiles) {
      if (file.size > maxFileSize) {
        setError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} is not allowed for ${file.name}.`);
        return;
      }
    }

    setUploading(true);
    setError('');

    try {
      const uploadedFiles = [];
      
      for (const file of selectedFiles) {
        const filePath = generateProjectPath(user.id, projectId, file.name);
        const storagePath = await uploadFile('projects', filePath, file);
        const publicUrl = getPublicUrl('projects', storagePath);
        
        uploadedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          path: storagePath,
          url: publicUrl
        });
      }

      setFiles(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('File upload error:', error);
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = e.target.value.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        e.target.value = '';
      }
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Project title is required');
      }

      if (!formData.description.trim()) {
        throw new Error('Project description is required');
      }

      if (files.length === 0 && !formData.github_url.trim()) {
        throw new Error('Please upload files or provide a GitHub URL');
      }

      // Prepare project data
      const projectData = {
        owner_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        files: files.map(file => file.path),
        github_url: formData.github_url.trim() || null,
        tags: formData.tags,
        verified: false,
        points_awarded: 0
      };

      // Insert project into database
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create project: ${insertError.message}`);
      }

      setSuccess('Project submitted successfully! It will be reviewed by mentors.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        github_url: '',
        tags: []
      });
      setFiles([]);
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);

    } catch (error) {
      console.error('Project submission error:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Submit Project</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter project title"
              />
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                placeholder="Describe your project, technologies used, and key features"
              />
            </div>

            {/* GitHub URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="https://github.com/username/repository"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Technologies & Tags
              </label>
              <input
                type="text"
                onKeyPress={handleTagAdd}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Press Enter to add tags (e.g., React, Node.js, MongoDB)"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="text-cyan-400 hover:text-cyan-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Files
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="project-files"
                  disabled={uploading}
                  accept=".pdf,.doc,.docx,.zip,.txt,.json,.jpg,.jpeg,.png,.gif"
                />
                <label
                  htmlFor="project-files"
                  className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-lg mb-2">📁 Upload Project Files</div>
                  <div className="text-sm text-gray-400">
                    PDF, Word, ZIP, images, or text files (max 10MB each)
                  </div>
                </label>
                {uploading && (
                  <div className="mt-2 text-cyan-400">Uploading files...</div>
                )}
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Uploaded Files:</h4>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">
                          {file.type.startsWith('image/') ? '🖼️' : 
                           file.type.includes('pdf') ? '📄' :
                           file.type.includes('zip') ? '📦' : '📁'}
                        </div>
                        <div>
                          <div className="text-white text-sm">{file.name}</div>
                          <div className="text-gray-400 text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Submitting...' : 'Submit Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectSubmissionModal;
