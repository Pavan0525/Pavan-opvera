import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Users, Settings, Crown, Bot } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { chatApi } from '../../lib/api';

const ChatWindow = ({ channel, onChannelSettings }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [channelMembers, setChannelMembers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (channel) {
      fetchMessages();
      fetchChannelMembers();
      subscribeToMessages();
      subscribeToTyping();
      markAsRead();
    }
  }, [channel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!channel) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          users!messages_sender_id_fkey(
            id,
            display_name,
            avatar_url,
            role
          )
        `)
        .eq('channel_id', channel.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelMembers = async () => {
    if (!channel) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, avatar_url, role')
        .in('id', channel.members || []);

      if (error) throw error;
      setChannelMembers(data || []);
    } catch (error) {
      console.error('Error fetching channel members:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!channel) return;

    const subscription = supabase
      .channel(`messages-${channel.id}`)
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `channel_id=eq.${channel.id}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Fetch the full message with user data
          const { data: newMessage, error } = await supabase
            .from('messages')
            .select(`
              *,
              users!messages_sender_id_fkey(
                id,
                display_name,
                avatar_url,
                role
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && newMessage) {
            setMessages(prev => [...prev, newMessage]);
            
            // Mark as read if it's not our own message
            if (newMessage.sender_id !== user?.id) {
              markAsRead();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const subscribeToTyping = () => {
    if (!channel) return;

    const subscription = supabase
      .channel(`typing-${channel.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = subscription.presenceState();
        const typing = Object.values(state)
          .flat()
          .filter((presence) => presence.typing && presence.user_id !== user?.id)
          .map((presence) => presence.user_id);
        
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await subscription.track({
            user_id: user?.id,
            typing: false,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const markAsRead = async () => {
    if (!channel || !user) return;

    try {
      // Update last_read_at for this user in this channel
      // This would require a user_channel_reads table or similar
      // For now, we'll just log it
      console.log(`Marking channel ${channel.id} as read for user ${user.id}`);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !channel || sending) return;

    setSending(true);
    try {
      // Check if this is an AI chat channel (you can determine this based on channel type or metadata)
      const isAIChat = channel.type === 'ai' || channel.metadata?.ai_enabled;
      
      if (isAIChat) {
        // Send AI message
        const context = {
          role: user.role,
          skills: user.skills || [],
          course: channel.metadata?.course,
          project: channel.metadata?.project
        };
        
        const { userMessage, aiMessage } = await chatApi.sendAIMessage(
          channel.id,
          user.id,
          message.trim(),
          context
        );
        
        // Add both messages to the UI
        setMessages(prev => [...prev, userMessage, aiMessage]);
      } else {
        // Regular message
        const { error } = await supabase
          .from('messages')
          .insert({
            channel_id: channel.id,
            sender_id: user.id,
            content: message.trim(),
            metadata: {}
          });

        if (error) throw error;
      }

      setMessage('');
      setIsTyping(false);
      
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      // Send typing indicator
      const subscription = supabase.channel(`typing-${channel.id}`);
      subscription.track({
        user_id: user?.id,
        typing: true,
        online_at: new Date().toISOString(),
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const subscription = supabase.channel(`typing-${channel.id}`);
      subscription.track({
        user_id: user?.id,
        typing: false,
        online_at: new Date().toISOString(),
      });
    }, 1000);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      // Log admin action
      if (user?.role === 'admin' || user?.role === 'mentor') {
        await supabase
          .from('audit_logs')
          .insert({
            actor_id: user.id,
            action: 'delete_message',
            target_type: 'message',
            target_id: messageId,
            details: { channel_id: channel.id }
          });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleFlagMessage = async (messageId) => {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          actor_id: user.id,
          action: 'flag_message',
          target_type: 'message',
          target_id: messageId,
          details: { channel_id: channel.id }
        });
      
      alert('Message flagged for review');
    } catch (error) {
      console.error('Error flagging message:', error);
    }
  };

  const isChannelAdmin = () => {
    return channel?.admins?.includes(user?.id) || user?.role === 'admin';
  };

  const canModerate = () => {
    return user?.role === 'admin' || user?.role === 'mentor' || isChannelAdmin();
  };

  if (!channel) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-400">
        <Users className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-xl font-medium mb-2">No Channel Selected</h3>
        <p className="text-sm">Choose a channel from the list to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-medium">{channel.name}</h3>
              {isChannelAdmin() && <Crown className="w-4 h-4 text-yellow-400" />}
            </div>
            <p className="text-gray-400 text-sm">
              {channelMembers.length} member{channelMembers.length !== 1 ? 's' : ''}
              {typingUsers.length > 0 && (
                <span className="text-cyan-400 ml-2">
                  {typingUsers.length === 1 ? 'Someone is typing...' : 'Multiple people typing...'}
                </span>
              )}
            </p>
          </div>
        </div>
        
        {isChannelAdmin() && (
          <button
            onClick={() => onChannelSettings?.(channel)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white/5 animate-pulse">
                  <div className="h-4 bg-white/20 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              sender={msg.users}
              timestamp={msg.created_at}
              isOwn={msg.sender_id === user?.id}
              isAI={msg.metadata?.ai}
              attachments={msg.metadata?.attachments}
              onDelete={handleDeleteMessage}
              onFlag={handleFlagMessage}
              canModerate={canModerate()}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="button"
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5 text-gray-400" />
          </button>
          <button
            type="button"
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Add emoji"
          >
            <Smile className="w-5 h-5 text-gray-400" />
          </button>
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
