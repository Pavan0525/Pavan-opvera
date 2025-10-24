import React from 'react';
import ChatPage from '../../../components/Chat/ChatPage';

const Chat = () => {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Chat</h1>
        <p className="text-gray-300">Connect with mentors and fellow students</p>
      </div>
      
      <div className="h-[calc(100vh-200px)]">
        <ChatPage />
      </div>
    </div>
  );
};

export default Chat;
