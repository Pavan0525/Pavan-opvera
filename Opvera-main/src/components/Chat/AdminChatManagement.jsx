import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Flag, User, MessageSquare, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const AdminChatManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
    fetchChannels();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          users!messages_sender_id_fkey(
            id,
            display_name,
            email,
            role
          ),
          channels!messages_channel_id_fkey(
            id,
            name,
            type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('id, name, type')
        .order('name');

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      // Log admin action
      await supabase
        .from('audit_logs')
        .insert({
          actor_id: user.id,
          action: 'admin_delete_message',
          target_type: 'message',
          target_id: messageId,
          details: { admin_action: true }
        });

      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const deleteSelectedMessages = async () => {
    if (selectedMessages.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedMessages.length} messages?`)) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .in('id', selectedMessages);

      if (error) throw error;

      // Log admin action
      await supabase
        .from('audit_logs')
        .insert({
          actor_id: user.id,
          action: 'admin_bulk_delete_messages',
          target_type: 'message',
          target_id: null,
          details: { 
            admin_action: true,
            message_count: selectedMessages.length,
            message_ids: selectedMessages
          }
        });

      setSelectedMessages([]);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting messages:', error);
      alert('Failed to delete messages');
    }
  };

  const banUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to ban ${userEmail}?`)) return;

    try {
      // Update user role to banned or add banned flag
      const { error } = await supabase
        .from('users')
        .update({ role: 'banned' })
        .eq('id', userId);

      if (error) throw error;

      // Log admin action
      await supabase
        .from('audit_logs')
        .insert({
          actor_id: user.id,
          action: 'ban_user',
          target_type: 'user',
          target_id: userId,
          details: { 
            admin_action: true,
            banned_user_email: userEmail
          }
        });

      alert('User has been banned');
      fetchMessages();
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchTerm || 
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.users?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.users?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesChannel = !filterChannel || message.channel_id === filterChannel;
    
    return matchesSearch && matchesChannel;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-400';
      case 'mentor': return 'text-purple-400';
      case 'student': return 'text-blue-400';
      case 'company': return 'text-green-400';
      case 'banned': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center text-red-400 py-8">
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Chat Management</h1>
          <p className="text-gray-300">Monitor and moderate all chat messages</p>
        </div>
        
        {selectedMessages.length > 0 && (
          <button
            onClick={deleteSelectedMessages}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Selected ({selectedMessages.length})</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search messages, users..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Channels</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>
                  {channel.name} ({channel.type})
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-400 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            {filteredMessages.length} messages found
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading messages...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMessages(filteredMessages.map(m => m.id));
                        } else {
                          setSelectedMessages([]);
                        }
                      }}
                      className="rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-white font-medium">Message</th>
                  <th className="px-4 py-3 text-left text-white font-medium">User</th>
                  <th className="px-4 py-3 text-left text-white font-medium">Channel</th>
                  <th className="px-4 py-3 text-left text-white font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-white font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((message) => (
                  <tr key={message.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(message.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMessages([...selectedMessages, message.id]);
                          } else {
                            setSelectedMessages(selectedMessages.filter(id => id !== message.id));
                          }
                        }}
                        className="rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="text-white text-sm truncate">
                          {message.content}
                        </p>
                        {message.metadata?.ai_response && (
                          <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded mt-1">
                            AI Response
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-white text-sm font-medium">
                            {message.users?.display_name || 'Unknown'}
                          </p>
                          <p className={`text-xs ${getRoleColor(message.users?.role)}`}>
                            {message.users?.role || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-white text-sm">
                            {message.channels?.name || 'Unknown'}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {message.channels?.type || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {message.users?.role !== 'admin' && (
                          <button
                            onClick={() => banUser(message.users.id, message.users.email)}
                            className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded transition-colors"
                            title="Ban user"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredMessages.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatManagement;
