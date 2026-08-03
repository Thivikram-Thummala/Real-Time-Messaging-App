import React, { useState } from 'react';
import { X, Plus, Lock, Globe } from 'lucide-react';
import { createRoom } from '../services';

export default function CreateRoomModal({ isOpen, onClose, onRoomCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
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
      const res = await createRoom(name.trim(), description.trim() || 'Public channel', isPrivate);
      if (res.success && res.data) {
        setName('');
        setDescription('');
        setIsPrivate(false);
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
          <button onClick={onClose} class="sec" style={{ padding: '0.3rem', borderRadius: '50%' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <input
              id="isPrivate"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isPrivate" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text)' }}>
              {isPrivate ? <Lock size={14} color="var(--warning)" /> : <Globe size={14} color="var(--success)" />}
              <span>Make Room Private</span>
            </label>
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
