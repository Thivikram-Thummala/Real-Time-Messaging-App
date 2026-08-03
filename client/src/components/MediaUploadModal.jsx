import React, { useState } from 'react';
import { X, Image, Link } from 'lucide-react';
import { uploadMedia } from '../services';

export default function MediaUploadModal({ isOpen, onClose, onAttachMedia }) {
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;
  async function handleSubmit(e) {
    e.preventDefault();
    if (!imageUrl.trim() && !selectedFile) {
      setError('Please provide or pick an image.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let finalUrl = imageUrl.trim();

      if (selectedFile) {
        const res = await uploadMedia(selectedFile);
        if (res.success && res.data?.url) {
          finalUrl = res.data.url;
        } else {
          throw new Error(res.message || 'Failed to upload media');
        }
      }

      onAttachMedia(finalUrl);
      setImageUrl('');
      setSelectedFile(null);
      onClose();
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="auth-modal" style={{ width: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Image color="var(--primary)" size={20} /> Attach Image / Media
          </h2>
          <button onClick={onClose} className="sec" style={{ padding: '0.3rem', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
          <div className="form-group">
            <label htmlFor="mediaUrl">Image URL *</label>
            <div style={{ position: 'relative' }}>
              <Link size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="mediaUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.2rem' }}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fileInput">Or pick from device</label>
            <input
              id="fileInput"
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  setImageUrl(URL.createObjectURL(file));
                } else {
                  setSelectedFile(null);
                }
              }}
              style={{ width: '100%' }}
            />
          </div>

          {imageUrl && (
            <div style={{ background: 'var(--bg)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <img src={imageUrl} alt="Preview" style={{ maxHeight: '140px', borderRadius: '6px', maxWidth: '100%' }} />
            </div>
          )}

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '0.82rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="sec" onClick={onClose} style={{ flex: 1 }} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Uploading...' : 'Attach Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
