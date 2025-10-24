import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import ChannelSettingsModal from './ChannelSettingsModal';

const ChatPage = () => {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showChannelSettings, setShowChannelSettings] = useState(false);

  const handleSelectChannel = (channel) => {
    setSelectedChannel(channel);
  };

  const handleCreateChannel = () => {
    // This would open a create channel modal
    console.log('Create channel clicked');
  };

  const handleChannelSettings = (channel) => {
    setSelectedChannel(channel);
    setShowChannelSettings(true);
  };

  const handleCloseSettings = () => {
    setShowChannelSettings(false);
  };

  return (
    <div className="h-full flex">
      {/* Channels List - Left Column */}
      <div className="w-80 bg-white/5 backdrop-blur-lg border-r border-white/20 flex flex-col">
        <div className="p-4 border-b border-white/20">
          <h2 className="text-white text-lg font-semibold">Channels</h2>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <ChatList
            selectedChannel={selectedChannel}
            onSelectChannel={handleSelectChannel}
            onCreateChannel={handleCreateChannel}
          />
        </div>
      </div>

      {/* Chat Window - Right Column */}
      <div className="flex-1 flex flex-col">
        <ChatWindow
          channel={selectedChannel}
          onChannelSettings={handleChannelSettings}
        />
      </div>

      {/* Channel Settings Modal */}
      {showChannelSettings && (
        <ChannelSettingsModal
          channel={selectedChannel}
          onClose={handleCloseSettings}
        />
      )}
    </div>
  );
};

export default ChatPage;
