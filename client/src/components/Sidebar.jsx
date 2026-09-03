import React, { useState } from 'react';
import { MessageSquare, Plus, LogOut, Search, X } from 'lucide-react';
import { leaveRoom } from '../services';

export default function Sidebar({
  isOpen,
  onClose,
  rooms,
  currentRoom,
  onSelectRoom,
  onOpenCreateModal,
  onOpenJoinModal,
  onRoomLeft,
  onRequestLeaveRoom
}) {
  const [searchQuery, setSearchQuery] = useState('');

  function handleLeave(e, room) {
    e.stopPropagation();
    if (onRequestLeaveRoom) {
      onRequestLeaveRoom(room);
    }
  }

  const filteredRooms = (rooms || []).filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2>Rooms ({filteredRooms.length})</h2>
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

        {/* Room Search Bar */}
        <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)' }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontSize: '0.82rem'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Rooms List */}
        <div className="rooms-list">
          {filteredRooms.length === 0 ? (
            <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
              {searchQuery ? (
                <>No rooms matching "<strong>{searchQuery}</strong>"</>
              ) : (
                <>No rooms joined yet.<br />Click <strong>"+ New"</strong> to create a channel.</>
              )}
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = currentRoom && currentRoom.id === room.id;
              return (
                <div
                  key={room.id}
                  className={`room-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectRoom(room)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', flex: 1, overflow: 'hidden' }}>
                    <div className="room-name">
                      <MessageSquare size={14} color="var(--primary)" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {room.name}
                      </span>
                    </div>
                    <div className="room-desc">{room.description || 'Chat channel'}</div>
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
