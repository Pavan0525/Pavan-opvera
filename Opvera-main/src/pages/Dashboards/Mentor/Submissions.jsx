import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Download, MessageSquare, Clock, User } from 'lucide-react';
import GlassCard from '../../../components/UI/GlassCard';
import { projectApi, assignmentApi } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

const Submissions = () => {
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mentorNotes, setMentorNotes] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      
      // Load projects needing verification
      const projectsData = await projectApi.getAllProjects();
      const pendingProjects = projectsData.filter(p => !p.verified);
      
      // Load assignments needing verification
      const assignmentsData = await assignmentApi.getAllAssignments();
      const pendingAssignments = assignmentsData.filter(a => !a.verified && a.submission_url);
      
      setProjects(pendingProjects);
      setAssignments(pendingAssignments);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (type, id) => {
    try {
      if (type === 'project') {
        await projectApi.verifyProject(id, true);
      } else if (type === 'assignment') {
        await assignmentApi.verifyAssignment(id, true, mentorNotes);
      }
      
      setShowModal(false);
      setMentorNotes('');
      loadSubmissions();
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Failed to approve submission');
    }
  };

  const handleReject = async (type, id) => {
    if (!mentorNotes.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }

    try {
      if (type === 'project') {
        await projectApi.updateProject(id, { 
          verified: false,
          mentor_notes: mentorNotes 
        });
      } else if (type === 'assignment') {
        await assignmentApi.verifyAssignment(id, false, mentorNotes);
      }
      
      setShowModal(false);
      setMentorNotes('');
      loadSubmissions();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('Failed to reject submission');
    }
  };

  const openModal = (submission, type) => {
    setSelectedSubmission({ ...submission, type });
    setShowModal(true);
    setMentorNotes('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSubmissionCard = (submission, type) => {
    const isProject = type === 'project';
    const studentName = submission.users?.display_name || 'Unknown Student';
    const submissionTitle = isProject ? submission.title : submission.title;
    const submissionDescription = isProject ? submission.description : submission.title;
    const files = isProject ? submission.files || [] : [submission.submission_url].filter(Boolean);
    const submittedAt = submission.created_at;

    return (
      <GlassCard key={submission.id} className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{submissionTitle}</h3>
                <p className="text-gray-300">by {studentName}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 text-yellow-400 bg-yellow-500/20">
                <Clock className="w-4 h-4" />
                <span>Pending Review</span>
              </span>
            </div>
            
            <p className="text-gray-300 mb-4">{submissionDescription}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
              <span>📅 Submitted: {formatDate(submittedAt)}</span>
              <span>📁 {files.length} files</span>
              <span className="capitalize">{type}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-white/10 text-white text-xs rounded-lg"
                >
                  📎 {file}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 ml-6">
            <button 
              onClick={() => openModal(submission, type)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Review</span>
            </button>
            {files.length > 0 && (
              <button className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Submissions</h1>
        <p className="text-gray-300">Review and provide feedback on student submissions</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-white/10 backdrop-blur-lg rounded-lg p-1 border border-white/20">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="text-lg">🚀</span>
            <span>Projects ({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'assignments'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="text-lg">📝</span>
            <span>Assignments ({assignments.length})</span>
          </button>
        </nav>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading submissions...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'projects' && projects.length === 0 && (
            <GlassCard className="p-8 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
              <p className="text-gray-300">No projects pending review at the moment.</p>
            </GlassCard>
          )}
          
          {activeTab === 'assignments' && assignments.length === 0 && (
            <GlassCard className="p-8 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
              <p className="text-gray-300">No assignments pending review at the moment.</p>
            </GlassCard>
          )}

          {activeTab === 'projects' && projects.map(project => renderSubmissionCard(project, 'project'))}
          {activeTab === 'assignments' && assignments.map(assignment => renderSubmissionCard(assignment, 'assignment'))}
        </div>
      )}

      {/* Review Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Review {selectedSubmission.type === 'project' ? 'Project' : 'Assignment'}
              </h3>
              <p className="text-gray-300">
                {selectedSubmission.title} by {selectedSubmission.users?.display_name}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-white font-medium mb-2">Mentor Feedback</label>
              <textarea
                value={mentorNotes}
                onChange={(e) => setMentorNotes(e.target.value)}
                placeholder="Provide constructive feedback for the student..."
                className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedSubmission.type, selectedSubmission.id)}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-all duration-200 flex items-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => handleApprove(selectedSubmission.type, selectedSubmission.id)}
                className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium hover:bg-green-500/30 transition-all duration-200 flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Submissions;
