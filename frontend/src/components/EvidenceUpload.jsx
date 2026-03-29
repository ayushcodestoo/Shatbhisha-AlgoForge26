import React, { useState } from 'react';
import axios from 'axios';

const EvidenceUpload = ({ onUpload, evidenceList }) => {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviewUrl(event.target.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('notes', notes);

    try {
      const response = await axios.post('http://localhost:5000/api/evidence/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        onUpload(response.data.evidence);
        setFile(null);
        setNotes('');
        setPreviewUrl(null);
        alert('Evidence uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Make sure backend is running on http://localhost:5000');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="evidence-card">
      <div className="card-header">
        <h3>Upload Evidence</h3>
        <p className="subtitle">Screenshots, documents, or other proof</p>
      </div>

      <div className="evidence-upload-form">
        <div className="upload-input-group">
          <label htmlFor="file-input" className="file-label">
            Select File (Image/PDF)
          </label>
          <input 
            id="file-input"
            type="file" 
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="file-input"
          />
          {file && <p className="file-name">Selected: {file.name}</p>}
        </div>

        {previewUrl && (
          <div className="preview-box">
            <p className="preview-label">Preview:</p>
            <img src={previewUrl} alt="Preview" className="preview-image" />
          </div>
        )}

        <textarea
          rows="2"
          placeholder="Add notes about this evidence (optional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="notes-textarea"
        />

        <button 
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn btn-primary"
        >
          {uploading ? 'Uploading...' : 'Upload Evidence'}
        </button>
      </div>

      {evidenceList && evidenceList.length > 0 && (
        <div className="evidence-list">
          <h4>Uploaded Evidence ({evidenceList.length}):</h4>
          {evidenceList.map((ev, i) => (
            <div key={i} className="evidence-item">
              <div className="evidence-meta">
                <span className="evidence-name">{ev.originalName}</span>
                <span className="evidence-time">{new Date(ev.timestamp).toLocaleString()}</span>
              </div>
              {ev.notes && <p className="evidence-notes">Notes: {ev.notes}</p>}
              <p className="evidence-hash">Hash: {ev.hash.slice(0, 24)}...</p>
            </div>
          ))}
        </div>
      )}

      <div className="info-box">
        <p><strong>Tip:</strong> Upload screenshots with timestamps visible. Upload within 2 hours of discovery for best results.</p>
      </div>
    </div>
  );
};

export default EvidenceUpload;
