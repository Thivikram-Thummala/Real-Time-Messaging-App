import React, { useEffect, useRef } from 'react';

export default function ChatFeed({ messages, currentUser, currentRoom }) {
  const feedEndRef = useRef(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentRoom) {
    return (
      <div className="messages-feed">
        <div style={{ margin: 'auto', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>
          👈 Select a room from the sidebar to view chat history and start messaging.
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="messages-feed">
        <div style={{ margin: 'auto', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>
          💬 No messages yet in <strong>#{currentRoom.name}</strong>.<br />
          Be the first to say hello! 👋
        </div>
      </div>
    );
  }

  return (
    <div className="messages-feed">
      {messages.map((msg, idx) => {
        const isMe = currentUser && (msg.sender_id === currentUser.id || msg.sender?.id === currentUser.id);
        const senderName = msg.sender?.username || (isMe ? currentUser.username : 'User');
        const initial = senderName.charAt(0).toUpperCase();

        const formattedTime = msg.created_at
          ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const isLegacyImageUrl = !msg.media_url && typeof msg.content === 'string' && (
          msg.content.startsWith('http://') || msg.content.startsWith('https://')
        ) && (
          msg.content.includes('.jpg') || msg.content.includes('.png') || msg.content.includes('.gif') || msg.content.includes('.webp') || msg.content.includes('unsplash.com') || msg.content.includes('cloudinary.com')
        );

        return (
          <div key={msg.id || idx} className={`message-bubble ${isMe ? 'me' : ''}`}>
            <div className="message-avatar">{initial}</div>
            <div className="message-content-wrapper">
              <div className="message-sender-info">
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{senderName}</span>
                <span>{formattedTime}</span>
              </div>
              <div className="message-body">
                {msg.media_url && (
                  <div style={{ marginTop: '0.25rem', marginBottom: msg.content ? '0.5rem' : '0' }}>
                    <img
                      src={msg.media_url}
                      alt="Attachment"
                      style={{ maxWidth: '280px', maxHeight: '200px', borderRadius: '8px', display: 'block' }}
                    />
                  </div>
                )}
                {isLegacyImageUrl && (
                  <div style={{ marginTop: '0.25rem' }}>
                    <img
                      src={msg.content}
                      alt="Legacy Attachment"
                      style={{ maxWidth: '280px', maxHeight: '200px', borderRadius: '8px', display: 'block' }}
                    />
                  </div>
                )}
                {msg.content && !isLegacyImageUrl && <div>{msg.content}</div>}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={feedEndRef} />
    </div>
  );
}
