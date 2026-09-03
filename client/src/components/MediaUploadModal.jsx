import React, { useState } from 'react';
import { X, Image, Upload } from 'lucide-react';
import { uploadMedia } from '../services';

export default function MediaUploadModal({ isOpen, onClose, onAttachMedia }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a file to upload.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await uploadMedia(selectedFile);
      if (res.success && res.data?.url) {
        onAttachMedia(res.data.url);
        setSelectedFile(null);
        setPreviewUrl(null);
        onClose();
      } else {
        throw new Error(res.message || 'Failed to upload media');
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
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
            <label htmlFor="fileInput">Select file from device *</label>
            <input
              id="fileInput"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ width: '100%' }}
              autoFocus
            />
          </div>

          {previewUrl && (
            <div style={{ background: 'var(--bg)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <img src={previewUrl} alt="Preview" style={{ maxHeight: '140px', borderRadius: '6px', maxWidth: '100%' }} />
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
            <button type="submit" style={{ flex: 1 }} disabled={loading || !selectedFile}>
              {loading ? 'Uploading...' : 'Upload & Attach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
