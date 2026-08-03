import React from 'react';
import { MessageSquare, Plus, LogIn, LogOut, Lock, Globe, X } from 'lucide-react';
import { leaveRoom } from '../services';

export default function Sidebar({
  isOpen,
  onClose,
  rooms,
  currentRoom,
  onSelectRoom,
  onOpenCreateModal,
  onOpenJoinModal,
  onRoomLeft
}) {

  async function handleLeave(e, room) {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to leave #${room.name}?`)) return;

    try {
      const res = await leaveRoom(room.id);
      if (res.success) {
        onRoomLeft(room.id);
      } else {
        alert(`Failed to leave room: ${res.message}`);
      }
    } catch (err) {
      alert(`Server error: ${err.message}`);
    }
  }

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2>Rooms ({rooms.length})</h2>
            <button className="mobile-close-btn" onClick={onClose}><X size={16} /></button>
          </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>

          <button
            className="sec"
            onClick={onOpenCreateModal}
            title="Create New Room"
            style={{ padding: '0.35rem 0.55rem', fontSize: '0.8rem' }}
          >
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      {/* Rooms List */}
      <div className="rooms-list">
        {rooms.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
            No rooms joined yet.<br />Click <strong>"+ New"</strong> or <strong>"Join"</strong> to get started.
          </div>
        ) : (
          rooms.map((room) => {
            const isActive = currentRoom && currentRoom.id === room.id;
            return (
              <div
                key={room.id}
                className={`room-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectRoom(room)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', flex: 1, overflow: 'hidden' }}>
                  <div className="room-name">
                    {room.is_private ? (
                      <Lock size={14} color="var(--warning)" />
                    ) : (
                      <MessageSquare size={14} color="var(--primary)" />
                    )}
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {room.name}
                    </span>
                  </div>
                  <div className="room-desc">{room.description || 'Public channel'}</div>
                </div>

                <button
                  className="sec"
                  onClick={(e) => handleLeave(e, room)}
                  title="Leave Room"
                  style={{
                    padding: '0.25rem',
                    borderRadius: '6px',
                    opacity: isActive ? 1 : 0.6,
                    background: 'transparent',
                    border: 'none'
                  }}
                >
                  <LogOut size={13} color="var(--text-muted)" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
    </>
  );
}
