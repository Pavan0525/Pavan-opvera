import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Flag, AlertTriangle, Users, Shield } from 'lucide-react';
import GlassCard from '../../../components/UI/GlassCard';
import { chatApi } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

const Chats = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      // Load channels where user is admin or mentor
      const { data, error } = await chatApi.getUserChats(user?.id);
      if (error) throw error;
      
      // Filter channels where user has admin privileges
      const adminChannels = data?.filter(channel => 
        channel.admins?.includes(user?.id) || user?.role === 'admin'
      ) || [];
      
      setChannels(adminChannels);
      if (adminChannels.length > 0) {
        setSelectedChannel(adminChannels[0]);
        loadMessages(adminChannels[0].id);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (channelId) => {
    try {
      const { data, error } = await chatApi.getChatMessages(channelId);
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await chatApi.deleteMessage(messageId);
      if (error) throw error;
      
      // Log mentor action
      await chatApi.logMentorAction({
        mentor_id: user.id,
        action: 'delete_message',
        target_id: messageId,
        channel_id: selectedChannel.id,
        details: { mentor_moderation: true }
      });

      loadMessages(selectedChannel.id);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const warnUser = async (userId, userName) => {
    const reason = prompt(`Enter warning reason for ${userName}:`);
    if (!reason) return;

    try {
      await chatApi.logMentorAction({
        mentor_id: user.id,
        action: 'warn_user',
        target_id: userId,
        channel_id: selectedChannel.id,
        details: { 
          mentor_moderation: true,
          warning_reason: reason,
          warned_user: userName
        }
      });

      alert(`Warning issued to ${userName}`);
    } catch (error) {
      console.error('Error warning user:', error);
      alert('Failed to issue warning');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-400';
      case 'mentor': return 'text-purple-400';
      case 'student': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Chat Moderation</h1>
            <p className="text-gray-300">Monitor and moderate group chats you admin</p>
          </div>
          <button
            onClick={() => setShowModerationPanel(!showModerationPanel)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>{showModerationPanel ? 'Hide' : 'Show'} Moderation Panel</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading channels...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Channels List */}
          <div className="lg:col-span-1">
            <GlassCard className="p-4 h-full">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Admin Channels</span>
              </h3>
              <div className="space-y-2">
                {channels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setSelectedChannel(channel);
                      loadMessages(channel.id);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      selectedChannel?.id === channel.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <div className="font-medium">{channel.name}</div>
                    <div className="text-sm opacity-75">{channel.type}</div>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Messages and Moderation */}
          <div className="lg:col-span-2">
            <GlassCard className="p-4 h-full flex flex-col">
              {selectedChannel ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      {selectedChannel.name} Messages
                    </h3>
                    <span className="text-sm text-gray-400">
                      {messages.length} messages
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3">
                    {messages.map(message => (
                      <div key={message.id} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-white">
                                {message.users?.display_name || 'Unknown'}
                              </span>
                              <span className={`text-xs ${getRoleColor(message.users?.role)}`}>
                                {message.users?.role}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(message.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm">{message.content}</p>
                          </div>
                          
                          {showModerationPanel && (
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => deleteMessage(message.id)}
                                className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                title="Delete message"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {message.users?.role !== 'admin' && (
                                <button
                                  onClick={() => warnUser(message.users?.id, message.users?.display_name)}
                                  className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded transition-colors"
                                  title="Warn user"
                                >
                                  <Flag className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a channel to view messages</p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
