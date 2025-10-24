import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, UserMinus, Crown, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const ChannelSettingsModal = ({ channel, onClose }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (channel) {
      fetchMembers();
    }
  }, [channel]);

  const fetchMembers = async () => {
    if (!channel) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, email, avatar_url, role')
        .in('id', channel.members || []);

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!newMemberEmail.trim() || addingMember) return;

    setAddingMember(true);
    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', newMemberEmail.trim())
        .single();

      if (userError) throw userError;

      if (!userData) {
        alert('User not found');
        return;
      }

      // Add user to channel members
      const updatedMembers = [...(channel.members || []), userData.id];
      
      const { error: updateError } = await supabase
        .from('channels')
        .update({ members: updatedMembers })
        .eq('id', channel.id);

      if (updateError) throw updateError;

      // Log admin action
      await supabase
        .from('audit_logs')
        .insert({
          actor_id: user.id,
          action: 'add_member',
          target_type: 'channel',
          target_id: channel.id,
          details: { 
            added_user_id: userData.id,
            added_user_email: newMemberEmail.trim()
          }
        });

      setNewMemberEmail('');
      fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      const updatedMembers = channel.members.filter(id => id !== memberId);
      
      const { error } = await supabase
        .from('channels')
        .update({ members: updatedMembers })
        .eq('id', channel.id);

      if (error) throw error;

      // Log admin action
      await supabase
        .from('audit_logs')
        .insert({
          actor_id: user.id,
          action: 'remove_member',
          target_type: 'channel',
          target_id: channel.id,
          details: { removed_user_id: memberId }
        });

      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  const toggleAdmin = async (memberId) => {
    try {
      const isAdmin = channel.admins?.includes(memberId);
      const updatedAdmins = isAdmin 
        ? channel.admins.filter(id => id !== memberId)
        : [...(channel.admins || []), memberId];

      const { error } = await supabase
        .from('channels')
        .update({ admins: updatedAdmins })
        .eq('id', channel.id);

      if (error) throw error;

      // Log admin action
      await supabase
        .from('audit_logs')
        .insert({
          actor_id: user.id,
          action: isAdmin ? 'remove_admin' : 'add_admin',
          target_type: 'channel',
          target_id: channel.id,
          details: { target_user_id: memberId }
        });

      // Refresh channel data
      window.location.reload();
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('Failed to update admin status');
    }
  };

  const isChannelAdmin = () => {
    return channel?.admins?.includes(user?.id) || user?.role === 'admin';
  };

  const canModerate = () => {
    return user?.role === 'admin' || user?.role === 'mentor' || isChannelAdmin();
  };

  if (!channel) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">{channel.name}</h2>
              <p className="text-gray-400 text-sm">Channel Settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Add Member */}
          {canModerate() && (
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">Add Member</h3>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter user email..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={addMember}
                  disabled={addingMember || !newMemberEmail.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{addingMember ? 'Adding...' : 'Add'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Members List */}
          <div>
            <h3 className="text-white font-medium mb-3">Members ({members.length})</h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {member.display_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-medium">{member.display_name}</p>
                          {channel.admins?.includes(member.id) && (
                            <Crown className="w-4 h-4 text-yellow-400" />
                          )}
                          {member.role === 'admin' && (
                            <Shield className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{member.email}</p>
                      </div>
                    </div>
                    
                    {canModerate() && member.id !== user?.id && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAdmin(member.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            channel.admins?.includes(member.id)
                              ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          {channel.admins?.includes(member.id) ? 'Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => removeMember(member.id)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          title="Remove member"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelSettingsModal;
