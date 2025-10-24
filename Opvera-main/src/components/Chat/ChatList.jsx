import React, { useState, useEffect } from 'react';
import { Plus, Users, Lock, Hash } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const ChatList = ({ selectedChannel, onSelectChannel, onCreateChannel }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchChannels();
    subscribeToChannels();
    subscribeToMessages();
  }, [user]);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select(`
          *,
          messages!messages_channel_id_fkey(
            id,
            content,
            created_at,
            sender_id,
            users!messages_sender_id_fkey(display_name, avatar_url)
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process channels with last message info
      const processedChannels = data.map(channel => {
        const lastMessage = channel.messages?.[0];
        return {
          ...channel,
          lastMessage: lastMessage?.content || 'No messages yet',
          lastMessageTime: lastMessage?.created_at,
          lastSender: lastMessage?.users?.display_name || 'Unknown'
        };
      });

      setChannels(processedChannels);
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChannels = () => {
    const channel = supabase
      .channel('channels-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'channels' },
        (payload) => {
          console.log('Channel change:', payload);
          fetchChannels(); // Refresh channels on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('New message:', payload);
          fetchChannels(); // Refresh to update last message
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getChannelIcon = (channel) => {
    switch (channel.type) {
      case 'group':
        return <Users className="w-5 h-5" />;
      case 'private':
        return <Lock className="w-5 h-5" />;
      case 'global':
        return <Hash className="w-5 h-5" />;
      default:
        return <Hash className="w-5 h-5" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const isChannelMember = (channel) => {
    if (!user) return false;
    return channel.members?.includes(user.id) || channel.type === 'global';
  };

  const filteredChannels = channels.filter(isChannelMember);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full p-3 rounded-lg bg-white/5 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Create Channel Button */}
      <button
        onClick={onCreateChannel}
        className="w-full p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Create Channel</span>
      </button>

      {/* Channels List */}
      {filteredChannels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => onSelectChannel(channel)}
          className={`w-full p-3 rounded-lg transition-all duration-200 text-left ${
            selectedChannel?.id === channel.id
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
              {getChannelIcon(channel)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium truncate">{channel.name}</h4>
                {unreadCounts[channel.id] > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {unreadCounts[channel.id]}
                  </span>
                )}
              </div>
              <p className="text-sm opacity-75 truncate">
                {channel.lastSender && `${channel.lastSender}: `}
                {channel.lastMessage}
              </p>
              <p className="text-xs opacity-60">{formatTime(channel.lastMessageTime)}</p>
            </div>
          </div>
        </button>
      ))}

      {filteredChannels.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No channels available</p>
          <p className="text-sm">Create a channel to start chatting!</p>
        </div>
      )}
    </div>
  );
};

export default ChatList;
