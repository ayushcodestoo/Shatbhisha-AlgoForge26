import React from 'react';

const ActionModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="action-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {content}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-modal-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default ActionModal;
