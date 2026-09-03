import React, { useState } from 'react';
import { X, Plus, MessageSquare } from 'lucide-react';
import { createRoom } from '../services';

export default function CreateRoomModal({ isOpen, onClose, onRoomCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Room Name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await createRoom(name.trim(), description.trim() || 'Chat room', false);
      if (res.success && res.data) {
        setName('');
        setDescription('');
        onRoomCreated(res.data);
        onClose();
      } else {
        setError(res.message || 'Failed to create room.');
      }
    } catch (err) {
      setError(`Server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="auth-modal" style={{ width: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus color="var(--primary)" size={20} /> Create New Room
          </h2>
          <button onClick={onClose} className="sec" style={{ padding: '0.3rem', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <div className="form-group">
            <label htmlFor="roomName">Room Name *</label>
            <input
              id="roomName"
              type="text"
              placeholder="e.g. general-chat, tech-talk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="roomDesc">Description</label>
            <input
              id="roomDesc"
              type="text"
              placeholder="Short channel description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '0.82rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="sec" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
