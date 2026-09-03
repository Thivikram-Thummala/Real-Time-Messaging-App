import React from 'react';
import { UserPlus, Users, LogOut } from 'lucide-react';
import ChatFeed from './ChatFeed';
import TypingBanner from './TypingBanner';
import MessageComposer from './MessageComposer';

export default function ChatWindow({
  currentRoom,
  messages,
  currentUser,
  isConnected,
  typingText,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onOpenAddMemberModal,
  onOpenMediaModal,
  onToggleMembers,
  onLeaveRoom
}) {
  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-title-info">
          <div className="chat-room-title">
            {currentRoom ? `# ${currentRoom.name}` : 'Select a Room'}
          </div>
          <div className="chat-room-sub">
            {currentRoom ? (currentRoom.description || `UUID: ${currentRoom.id}`) : 'Choose a channel from sidebar'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {currentRoom && (
            <>
              <button
                className="sec"
                onClick={onOpenAddMemberModal}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', borderRadius: '20px' }}
                title="Add members to room"
              >
                <UserPlus size={14} color="var(--primary)" /> <span className="hide-mobile">Add Member</span>
              </button>
              <button
                className="sec"
                onClick={() => onLeaveRoom(currentRoom)}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', borderRadius: '20px', color: '#ef4444' }}
                title="Leave Room"
              >
                <LogOut size={14} color="#ef4444" /> <span className="hide-mobile">Leave</span>
              </button>
            </>
          )}
          <button className="mobile-members-btn" onClick={onToggleMembers} title="Toggle Members">
            <Users size={18} />
          </button>
          <div className="status-badge hide-mobile">
            <div className={`status-dot ${isConnected ? 'online' : ''}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <ChatFeed
        messages={messages}
        currentUser={currentUser}
        currentRoom={currentRoom}
      />

      {/* Typing Indicator Banner */}
      <TypingBanner typingText={typingText} />

      {/* Message Composer Input */}
      <MessageComposer
        currentRoom={currentRoom}
        onSendMessage={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        onOpenMediaModal={onOpenMediaModal}
      />
    </div>
  );
}
