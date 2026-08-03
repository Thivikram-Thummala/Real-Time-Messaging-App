import React from 'react';

export default function TypingBanner({ typingText }) {
  if (!typingText) {
    return <div className="typing-indicator-banner" />;
  }

  return (
    <div className="typing-indicator-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <span>{typingText}</span>
    </div>
  );
}
