import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, Check, Circle } from 'lucide-react';
import { searchUsers, addMemberToRoom } from '../services';

export default function AddMemberModal({ isOpen, onClose, currentRoom, existingMembers, onMemberAdded }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedUserIds, setAddedUserIds] = useState(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setUserResults([]);
      setError('');
      return;
    }
    // Perform initial search
    handleSearch('');
  }, [isOpen]);

  async function handleSearch(query) {
    setLoading(true);
    setError('');
    try {
      const res = await searchUsers(query);
      if (res.success && Array.isArray(res.data)) {
        setUserResults(res.data);
      }
    } catch (err) {
      setError(`Search error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleQueryChange(e) {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  }

  async function handleAddUser(user) {
    if (!currentRoom) return;

    try {
      const res = await addMemberToRoom(currentRoom.id, user.id);
      if (res.success || res.message?.includes('already a member')) {
        setAddedUserIds(prev => new Set(prev).add(user.id));
        if (onMemberAdded) onMemberAdded(user);
      } else {
        alert(res.message || 'Failed to add user to room.');
      }
    } catch (err) {
      alert(`Server error: ${err.message}`);
    }
  }

  if (!isOpen || !currentRoom) return null;

  const existingMemberIds = new Set((existingMembers || []).map(m => m.id));

  return (
    <div className="modal-overlay">
      <div className="auth-modal" style={{ width: '460px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus color="var(--primary)" size={20} /> Add Members to #{currentRoom.name}
          </h2>
          <button onClick={onClose} className="sec" style={{ padding: '0.3rem', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginTop: '0.75rem' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search users by username or email..."
            value={searchQuery}
            onChange={handleQueryChange}
            style={{ width: '100%', paddingLeft: '2.2rem' }}
            autoFocus
          />
        </div>

        {/* Search Results List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto', marginTop: '0.75rem' }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', fontSize: '0.85rem' }}>
              Searching users...
            </div>
          ) : userResults.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', fontSize: '0.85rem' }}>
              No users found matching "{searchQuery}"
            </div>
          ) : (
            userResults.map(user => {
              const isAlreadyMember = existingMemberIds.has(user.id) || addedUserIds.has(user.id);
              const initial = (user.username || 'U').charAt(0).toUpperCase();

              return (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg)',
                    borderRadius: '10px',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ position: 'relative' }}>
                      <div className="avatar-badge" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                        {initial}
                      </div>
                      <Circle
                        size={10}
                        fill={user.is_online ? 'var(--success)' : 'var(--text-muted)'}
                        color="none"
                        style={{ position: 'absolute', bottom: '0', right: '0' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {user.username}
                        {user.is_online && <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 500 }}>(Online)</span>}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</span>
                    </div>
                  </div>

                  {isAlreadyMember ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 500 }}>
                      <Check size={14} /> Added
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddUser(user)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      + Add
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: '0.82rem', textAlign: 'center', marginTop: '0.5rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
          <button className="sec" onClick={onClose} style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
