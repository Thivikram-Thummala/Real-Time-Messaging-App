import React from 'react';
import { Users, Circle, Shield, X } from 'lucide-react';

export default function MembersList({ members, isOpen, onClose }) {
  const onlineCount = (members || []).filter(m => m.is_online).length;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`members-sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={14} /> Members ({members ? members.length : 0})
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {members && members.length > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 500 }}>
                {onlineCount} Online
              </span>
            )}
            <button className="mobile-close-btn" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', overflowY: 'auto', flex: 1 }}>
        {!members || members.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No room selected or no members listed.</div>
        ) : (
          members.map((member, i) => {
            const initial = (member.username || 'U').charAt(0).toUpperCase();
            const isAdmin = member.role === 'admin';

            return (
              <div
                key={member.id || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.6rem',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ position: 'relative' }}>
                    <div className="avatar-badge" style={{ width: '28px', height: '28px', fontSize: '0.78rem' }}>
                      {initial}
                    </div>
                    <Circle
                      size={8}
                      fill={member.is_online ? 'var(--success)' : 'var(--text-muted)'}
                      color="none"
                      style={{ position: 'absolute', bottom: '0', right: '0' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {member.username}
                      {isAdmin && <Shield size={12} color="var(--warning)" title="Room Admin" />}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {member.is_online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    </>
  );
}
