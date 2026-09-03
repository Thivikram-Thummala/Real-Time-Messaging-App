import React from 'react';
import { Users, Circle, Shield, UserMinus, X, Info } from 'lucide-react';

export default function MembersList({ members, currentRoom, currentUser, isOpen, onClose, onRemoveMember }) {
  const onlineCount = (members || []).filter(m => m.is_online).length;

  const currentUserId = currentUser?.id || currentUser?.userId;
  const isCurrentAdmin = currentRoom && (
    currentRoom.created_by === currentUserId ||
    (members || []).some(m => (m.id === currentUserId || m.userId === currentUserId) && m.role === 'admin')
  );

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`members-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            #{currentRoom ? currentRoom.name : 'Room Info'}
          </h3>
          <button className="mobile-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Top Portion: Room Description */}
        <div style={{
          padding: '0.7rem 0.8rem',
          background: 'var(--bg)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          marginBottom: '0.85rem'
        }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--primary)',
            marginBottom: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Info size={13} /> Description
          </div>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text)',
            margin: 0,
            lineHeight: '1.4',
            wordBreak: 'break-word'
          }}>
            {currentRoom?.description || 'No description provided for this channel.'}
          </p>
        </div>

        {/* Room Members Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={13} /> Room Members ({members ? members.length : 0})
          </h4>
          {members && members.length > 0 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 600 }}>
              {onlineCount} Online
            </span>
          )}
        </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', overflowY: 'auto', flex: 1 }}>
        {!members || members.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No room selected or no members listed.</div>
        ) : (
          members.map((member, i) => {
            const initial = (member.username || 'U').charAt(0).toUpperCase();
            const isAdmin = member.role === 'admin' || (currentRoom && currentRoom.created_by === member.id);
            const isSelf = currentUser && (currentUser.id === member.id || currentUser.userId === member.id);
            const canRemove = isCurrentAdmin && !isSelf;

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
                      {member.username} {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>(You)</span>}
                      {isAdmin && <Shield size={12} color="var(--warning)" title="Room Admin" />}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {member.is_online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {canRemove && onRemoveMember && (
                  <button
                    onClick={() => onRemoveMember(member)}
                    title={`Remove ${member.username} (Admin Action)`}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <UserMinus size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
    </>
  );
}
