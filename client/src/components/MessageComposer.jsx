import React, { useState, useRef } from 'react';
import { Send, Image } from 'lucide-react';

export default function MessageComposer({
  currentRoom,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onOpenMediaModal
}) {
  const [text, setText] = useState('');
  const typingTimerRef = useRef(null);

  function handleChange(e) {
    const val = e.target.value;
    setText(val);

    if (currentRoom) {
      if (onTypingStart) onTypingStart();

      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        if (onTypingStop) onTypingStop();
      }, 1500);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  }

  function submitMessage() {
    if (!text.trim() || !currentRoom) return;
    const content = text.trim();
    setText('');

    clearTimeout(typingTimerRef.current);
    if (onTypingStop) onTypingStop();

    onSendMessage(content);
  }

  return (
    <form className="message-composer" onSubmit={(e) => { e.preventDefault(); submitMessage(); }}>
      <button
        type="button"
        className="sec"
        onClick={onOpenMediaModal}
        disabled={!currentRoom}
        title="Attach image or file"
        style={{ padding: '0.65rem', borderRadius: '10px' }}
      >
        <Image size={18} color="var(--primary)" />
      </button>

      <input
        type="text"
        className="message-input"
        placeholder={currentRoom ? `Message #${currentRoom.name}... (Press Enter to send)` : 'Select a room to start chatting...'}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={!currentRoom}
      />

      <button type="submit" disabled={!currentRoom || !text.trim()}>
        <Send size={16} />
      </button>
    </form>
  );
}
