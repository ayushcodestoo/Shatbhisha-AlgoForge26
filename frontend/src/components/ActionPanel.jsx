import React, { useState } from 'react';
import { getImmediateActions } from '../utils/scamDetector';
import ActionModal from './ActionModal';

const ActionPanel = ({ scamTypes, score, complaintText }) => {
  const actions = getImmediateActions(scamTypes);
  const [showBankModal, setShowBankModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [blockedNumbers, setBlockedNumbers] = useState([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [numberToBlock, setNumberToBlock] = useState('');

  // Determine if this is a high-risk scam
  const isHighRisk = score && score <= 30;
  const isMediumRisk = score && score > 30 && score <= 60;

  // Determine scam type for context-based actions
  const scamType = scamTypes && scamTypes.length > 0 ? scamTypes[0].type : '';

  // Bank helpline data
  const bankHelplines = {
    'SBI': '1800-1234-1234',
    'HDFC': '1800-202-6161',
    'ICICI': '1800-1080-1080',
    'Axis': '1860-500-5555',
    'PNB': '1800-1800-180',
    'BoB': '+91 891 100 2555'
  };

  // Determine which action buttons to show based on scam type
  const getVisibleActions = () => {
    const visible = {
      callBank: ['UPI BANK', 'O T P', 'PHISHING'].includes(scamType),
      copyComplaint: true,
      cybercrime: true,
      blockNumber: ['UPI BANK', 'O T P', 'SEXTORTION'].includes(scamType)
    };
    return visible;
  };

  const actions_visible = getVisibleActions();

  // Copy complaint to clipboard
  const handleCopyComplaint = async () => {
    try {
      const textToCopy = complaintText || 'Scam Alert - Please take immediate action';
      await navigator.clipboard.writeText(textToCopy);
      setCopyFeedback('Complaint copied to clipboard!');
      setTimeout(() => setCopyFeedback(''), 3000);
    } catch (err) {
      setCopyFeedback('Failed to copy - try again');
      setTimeout(() => setCopyFeedback(''), 3000);
    }
  };

  // Open cybercrime portal
  const handleOpenPortal = () => {
    window.open('https://cybercrime.gov.in', '_blank');
  };

  // Handle block number
  const handleBlockNumber = () => {
    if (numberToBlock.trim()) {
      setBlockedNumbers([...blockedNumbers, numberToBlock]);
      setNumberToBlock('');
      setShowBlockModal(false);
    }
  };

  // Safe state - no scams detected
  if (!scamTypes || scamTypes.length === 0) {
    return (
      <div className="action-panel safe">
        <div className="panel-header">
          <h3>Message Assessment: Safe</h3>
          <p className="urgency-text">No fraud indicators detected</p>
        </div>
        <div className="action-list">
          <div className="action-item safe">
            <span className="action-number">1</span>
            <span className="action-text">This message appears safe based on current analysis</span>
          </div>
          <div className="action-item safe">
            <span className="action-number">2</span>
            <span className="action-text">Always verify sender identity if you have doubts</span>
          </div>
        </div>
      </div>
    );
  }

  const color = score <= 30 ? '#dc2626' : score <= 60 ? '#d97706' : '#059669';
  const riskLevel = score <= 30 ? 'High Risk' : score <= 60 ? 'Medium Risk' : 'Low Risk';

  return (
    <>
      <div className="action-panel critical" style={{ borderLeftColor: color }}>
        <div className="panel-header" style={{ backgroundColor: color + '15' }}>
          <h3 style={{ color }}>Fraud Detected - Immediate Action Required</h3>
          <p className="urgency-text">Risk Level: {riskLevel}</p>
        </div>

        {/* Recommended Actions List */}
        <div className="action-list">
          {actions.map((action, i) => (
            <div key={i} className="action-item critical" style={{ borderLeftColor: color }}>
              <span className="action-number">{i + 1}</span>
              <span className="action-text">{action.replace(/^[^a-zA-Z0-9]+/, '')}</span>
            </div>
          ))}
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div className="quick-actions-section">
          <p className="quick-actions-title">Immediate Actions</p>
          <div className="quick-action-buttons">
            {/* Call Bank Button */}
            {actions_visible.callBank && (
              <button 
                className="quick-action-btn bank-btn"
                onClick={() => setShowBankModal(true)}
                title="Contact your bank immediately"
              >
                <span className="btn-text">Call Bank</span>
              </button>
            )}

            {/* Copy Complaint Button */}
            {actions_visible.copyComplaint && (
              <button 
                className="quick-action-btn copy-btn"
                onClick={handleCopyComplaint}
                title="Copy complaint text"
              >
                <span className="btn-text">Copy</span>
              </button>
            )}

            {/* Cybercrime Portal Button */}
            {actions_visible.cybercrime && (
              <button 
                className="quick-action-btn portal-btn"
                onClick={handleOpenPortal}
                title="Open cybercrime.gov.in"
              >
                <span className="btn-text">File Report</span>
              </button>
            )}

            {/* Block Number Button */}
            {actions_visible.blockNumber && (
              <button 
                className="quick-action-btn block-btn"
                onClick={() => setShowBlockModal(true)}
                title="Block this number"
              >
                <span className="btn-text">Block</span>
              </button>
            )}
          </div>

          {/* Feedback Message */}
          {copyFeedback && (
            <div className="action-feedback">
              {copyFeedback}
            </div>
          )}

          {/* Blocked Numbers List */}
          {blockedNumbers.length > 0 && (
            <div className="blocked-numbers-info">
              <p><strong>Blocked Numbers ({blockedNumbers.length})</strong></p>
              <div className="blocked-list">
                {blockedNumbers.map((num, idx) => (
                  <span key={idx} className="blocked-number">{num}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Info Section */}
        <div className="action-info-section">
          <div className="info-card info-urgent">
            <div>
              <p className="info-title">Critical Timeline</p>
              <p className="info-text">Report fraud to authorities within 2 hours for maximum recovery chance</p>
            </div>
          </div>

          {scamType === 'UPI BANK' && (
            <div className="info-card info-bank">
              <div>
                <p className="info-title">Priority: Contact Your Bank</p>
                <p className="info-text">Block your cards immediately to prevent further unauthorized transactions</p>
              </div>
            </div>
          )}

          {scamType === 'O T P' && (
            <div className="info-card info-security">

              <div>
                <p className="info-title">Security: Change All Passwords</p>
                <p className="info-text">Never share OTP with anyone. Update passwords immediately on all accounts</p>
              </div>
            </div>
          )}

          {scamType === 'JOB' && (
            <div className="info-card info-verify">
              <div>
                <p className="info-title">Verify Independently</p>
                <p className="info-text">Always verify job offers directly through official company websites</p>
              </div>
            </div>
          )}
        </div>

        <div className="action-footer">
          <p className="recovery-timeline">
            <strong>Important:</strong> Act quickly but calmly. Verify information and file official reports within 2 hours for best results.
          </p>
        </div>
      </div>

      {/* Bank Helpline Modal */}
      <ActionModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        title="📞 Bank Helpline Numbers"
        content={
          <div className="modal-bank-content">
            <p className="modal-instruction">Contact your bank to block transactions immediately:</p>
            <div className="helpline-list">
              {Object.entries(bankHelplines).map(([bank, number]) => (
                <div key={bank} className="helpline-item">
                  <span className="bank-name">{bank}</span>
                  <a 
                    href={`tel:${number}`} 
                    className="helpline-number"
                    title="Click to call"
                  >
                    {number}
                  </a>
                </div>
              ))}
            </div>
            <p className="modal-note">Note: Contact details are for reference. Verify with your bank's official website.</p>
          </div>
        }
      />

      {/* Block Number Modal */}
      <ActionModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title="🚫 Block Number"
        content={
          <div className="modal-block-content">
            <p>Enter the number to block:</p>
            <input 
              type="text" 
              placeholder="e.g., +91 98765 43210"
              value={numberToBlock}
              onChange={(e) => setNumberToBlock(e.target.value)}
              className="block-input"
              onKeyPress={(e) => e.key === 'Enter' && handleBlockNumber()}
            />
            <div className="modal-actions">
              <button 
                onClick={handleBlockNumber}
                className="btn-confirm"
              >
                Block Now
              </button>
              <button 
                onClick={() => setShowBlockModal(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        }
      />
    </>
  );
};

export default ActionPanel;
