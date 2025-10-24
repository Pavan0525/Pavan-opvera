import React, { useState } from 'react';
import { MoreVertical, Trash2, Flag, Download, Bot } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const MessageBubble = ({ 
  message, 
  sender, 
  timestamp, 
  isOwn = false, 
  attachments = [], 
  isAI = false,
  onDelete,
  onFlag,
  canModerate = false 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAttachmentDownload = async (attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .download(attachment.path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm('Are you sure you want to delete this message?')) {
      await onDelete(message.id);
    }
    setShowMenu(false);
  };

  const handleFlag = async () => {
    if (onFlag && window.confirm('Are you sure you want to flag this message?')) {
      await onFlag(message.id);
    }
    setShowMenu(false);
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
        isAI 
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          : isOwn 
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
            : 'bg-white/10 text-gray-300'
      }`}>
        {/* Message Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            {isAI && <Bot className="w-4 h-4" />}
            <span className="text-xs font-medium opacity-75">
              {sender?.display_name || sender?.name || 'Unknown'}
            </span>
          </div>
          
          {/* Message Actions Menu */}
          {(isOwn || canModerate) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10 min-w-[120px]">
                  {isOwn && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                  {canModerate && !isOwn && (
                    <>
                      <button
                        onClick={handleDelete}
                        className="w-full px-3 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={handleFlag}
                        className="w-full px-3 py-2 text-left text-yellow-400 hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Flag</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="mb-2">
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content || message.text || message}
          </p>
        </div>

        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="space-y-2 mb-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                      📎
                    </div>
                    <div>
                      <p className="text-xs font-medium truncate max-w-[150px]">
                        {attachment.name}
                      </p>
                      <p className="text-xs opacity-75">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAttachmentDownload(attachment)}
                    className="p-1 hover:bg-white/20 rounded"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Metadata */}
        {isAI && message.metadata?.ai_response && (
          <div className="mt-2 p-2 bg-white/10 rounded text-xs">
            <p className="opacity-75">🤖 AI Response</p>
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-xs mt-1 ${
          isAI || isOwn ? 'text-white/70' : 'text-gray-400'
        }`}>
          {formatTime(timestamp || message.created_at)}
        </p>

        {/* Read Receipt */}
        {isOwn && message.read_by && (
          <div className="flex items-center space-x-1 mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs opacity-75">Read</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
