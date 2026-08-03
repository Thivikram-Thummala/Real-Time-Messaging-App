import React, { useState } from 'react';
import { X, Save, User } from 'lucide-react';
import { updateProfile } from '../services';

export default function ProfileModal({ isOpen, onClose, currentUser, onProfileUpdated }) {
  const [username, setUsername] = useState(currentUser?.username || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state if currentUser changes
  React.useEffect(() => {
    if (currentUser) setUsername(currentUser.username);
  }, [currentUser]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfile({ username });
      if (res.success) {
        onProfileUpdated(res.data);
        onClose();
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message || 'Server error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="avatar-badge" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>

          <div className="form-group">
            <label>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Enter new username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '2.2rem', width: '100%', boxSizing: 'border-box' }}
                autoFocus
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
