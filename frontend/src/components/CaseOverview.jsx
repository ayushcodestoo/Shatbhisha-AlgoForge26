import React, { useState, useMemo } from 'react';

const CaseOverview = ({ result, evidenceList, hasEvidence }) => {
  if (!result) return null;

  // Modal state
  const [isHelplineModalOpen, setIsHelplineModalOpen] = useState(false);

  // Bank detection function - analyzes message for bank mentions
  const detectBankFromMessage = () => {
    if (!result.originalText) return null;

    const messageText = result.originalText.toLowerCase();
    
    // Bank detection patterns
    const bankPatterns = {
      'SBI': ['sbi', 'state bank', 'state bank of india'],
      'HDFC Bank': ['hdfc', 'hdfc bank'],
      'ICICI Bank': ['icici', 'icici bank'],
      'Axis Bank': ['axis', 'axis bank'],
    };

    // Check for each bank
    for (const [bankName, keywords] of Object.entries(bankPatterns)) {
      for (const keyword of keywords) {
        if (messageText.includes(keyword)) {
          return bankName;
        }
      }
    }

    return null;
  };

  // Memoize detected bank to avoid unnecessary recalculations
  const detectedBank = useMemo(() => detectBankFromMessage(), [result.originalText]);

  // Determine status
  const getStatus = () => {
    if (hasEvidence) return 'Evidence Added';
    return 'Detection Complete';
  };

  // Get priority level - FIXED LOGIC
  // Lower score = higher threat = higher priority
  const getPriorityLevel = () => {
    const score = result.score;
    const scamType = result.scamTypes?.[0]?.type || '';
    const riskLevel = result.scamTypes?.[0]?.riskLevel || '';
    
    // HIGH PRIORITY: Score <= 40 OR Critical/High Risk OR Bank/Phishing
    if (score <= 40 || riskLevel === 'critical' || 
        ['Phishing', 'UPI Bank Fraud', 'OTP Scam'].includes(scamType)) {
      return 'High Priority – Immediate action required';
    }
    
    // MEDIUM PRIORITY: Score 41-70
    if (score <= 70) {
      return 'Medium Priority – Take action soon';
    }
    
    // LOW PRIORITY: Score > 70
    return 'Low Priority – Monitor carefully';
  };

  // Get priority color - matches priority level
  const getPriorityColor = (score, scamType = '', riskLevel = '') => {
    // HIGH PRIORITY = Red
    if (score <= 40 || riskLevel === 'critical' || 
        ['Phishing', 'UPI Bank Fraud', 'OTP Scam'].includes(scamType)) {
      return '#dc2626'; // Red
    }
    
    // MEDIUM PRIORITY = Orange
    if (score <= 70) {
      return '#d97706'; // Orange
    }
    
    // LOW PRIORITY = Green
    return '#059669'; // Green
  };

  // Generate simple explanation
  const getSimpleExplanation = () => {
    const detectedScamType = result.scamTypes?.[0]?.type || 'Unknown';
    const explanations = {
      'OTP Scam': 'Scammer is trying to steal your account credentials using fake OTP requests.',
      'Phishing': 'Fraudulent message designed to trick you into revealing financial or personal information.',
      'UPI Bank Fraud': 'Attacker is attempting to access your bank account through fake payment links.',
      'Lottery Scam': 'You are being targeted for a fake lottery or prize scheme.',
      'Job Fraud': 'Fake job offer designed to collect personal information or money.',
      'Technical Support Scam': 'Scammer pretending to be tech support to gain remote access to your device.',
      'Investment Scam': 'Fraudulent investment opportunity promising unrealistic returns.',
      'Romance Scam': 'Fake romantic interest being used to extract money or information.',
      'Prize Scam': 'Scammer claiming you won a prize that requires payment or personal details.',
      'Verification Scam': 'Fake verification request to capture your account credentials.',
    };
    return explanations[detectedScamType] || 'Suspicious message detected. Exercise caution and avoid sharing personal information.';
  };

  // Bank helpline data
  const bankHelplines = [
    { name: 'SBI', numbers: ['1800-1234-000', '1800-2100-000'], abbr: 'SBI' },
    { name: 'HDFC Bank', numbers: ['1800-202-6161'], abbr: 'HDFC' },
    { name: 'ICICI Bank', numbers: ['1800-1080'], abbr: 'ICICI' },
    { name: 'Axis Bank', numbers: ['1860-419-5555'], abbr: 'Axis' },
  ];

  // Reorder banks - put detected bank first
  const getOrderedBankHelplines = () => {
    if (!detectedBank) return bankHelplines;

    const detected = bankHelplines.find(bank => bank.name === detectedBank);
    const others = bankHelplines.filter(bank => bank.name !== detectedBank);

    return detected ? [detected, ...others] : bankHelplines;
  };

  // Determine if bank helpline should be shown
  const shouldShowBankHelpline = () => {
    const scamType = result.scamTypes?.[0]?.type || '';
    const bankRelatedScams = ['UPI Bank Fraud', 'Phishing', 'OTP Scam', 'Verification Scam'];
    return bankRelatedScams.includes(scamType);
  };

  // Handle copy to clipboard
  const copyToClipboard = (number) => {
    navigator.clipboard.writeText(number).then(() => {
      alert(`Helpline number copied: ${number}`);
    });
  };

  const scamType = result.scamTypes?.[0]?.type || 'Unknown';
  const riskLevel = result.scamTypes?.[0]?.riskLevel?.toUpperCase() || 'UNKNOWN';

  return (
    <section className="case-overview-section">
      <div className="section-header">
        <h2>Risk Analysis & Recommended Actions</h2>
        <p className="section-subtitle">Clear threat assessment and immediate steps</p>
      </div>

      <div className="case-overview-grid">
        {/* Detection Result Card */}
        <div className="case-summary-card">
          <h3 className="card-title">Detection Result</h3>
          <div className="case-fields">
            <div className="case-field">
              <span className="field-label">Scam Type</span>
              <span className="field-value">{scamType}</span>
            </div>
            <div className="case-field">
              <span className="field-label">Risk Level</span>
              <span className={`field-value risk-${riskLevel.toLowerCase()}`}>{riskLevel}</span>
            </div>
            <div className="case-field">
              <span className="field-label">Trust Score</span>
              <span className="field-value">{result.score}/100</span>
            </div>
            <div className="case-field">
              <span className="field-label">Status</span>
              <span className="field-value status-badge">{getStatus()}</span>
            </div>
          </div>
        </div>

        {/* Simple Explanation Card */}
        <div className="explanation-card">
          <h3 className="card-title">What This Means</h3>
          <p className="explanation-text">{getSimpleExplanation()}</p>
        </div>

        {/* Recommended Immediate Actions */}
        <div className="actions-card">
          <h3 className="card-title">Immediate Actions</h3>
          <ol className="actions-list">
            <li>Contact your bank immediately if financial transaction involved</li>
            <li>Do not click any links or download attachments</li>
            <li>Do not share personal or financial information</li>
            <li>Block the sender immediately</li>
            <li>Report within 2 hours for best recovery chances</li>
          </ol>

          {/* Recommended Bank Section - Shows when bank is detected */}
          {shouldShowBankHelpline() && detectedBank && (
            <div className="recommended-bank-section">
              <p className="recommended-label">Recommended:</p>
              <p className="recommended-bank-name">Contact {detectedBank} immediately</p>
            </div>
          )}

          {/* Bank Helpline Button - Context-based visibility */}
          {shouldShowBankHelpline() && (
            <button 
              onClick={() => setIsHelplineModalOpen(true)}
              className="contact-bank-btn"
            >
              Contact Bank Helpline
            </button>
          )}
        </div>

        {/* Response Priority */}
        <div className="priority-card">
          <h3 className="card-title">Response Priority</h3>
          <div 
            className="priority-badge"
            style={{ borderLeftColor: getPriorityColor(result.score, result.scamTypes?.[0]?.type, result.scamTypes?.[0]?.riskLevel) }}
          >
            {getPriorityLevel()}
          </div>
          <p className="priority-note">
            Recovery chances decrease significantly after 2 hours. Take immediate action.
          </p>
        </div>
      </div>

      {/* Evidence Status */}
      {evidenceList && evidenceList.length > 0 && (
        <div className="evidence-status-bar">
          <span className="status-label">Evidence Collected:</span>
          <span className="status-value">{evidenceList.length} file{evidenceList.length !== 1 ? 's' : ''} ready for complaint</span>
        </div>
      )}

      {/* Bank Helpline Modal */}
      {isHelplineModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsHelplineModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Bank Helpline Assistance</h2>
              <button 
                onClick={() => setIsHelplineModalOpen(false)}
                className="modal-close-btn"
                title="Close"
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="helpline-list-modal">
                {getOrderedBankHelplines().map((bank, index) => (
                  <div 
                    key={index} 
                    className={`helpline-row ${detectedBank === bank.name ? 'recommended-row' : ''}`}
                  >
                    <div className="helpline-col-bank">
                      {detectedBank === bank.name && (
                        <span className="recommended-badge">Recommended</span>
                      )}
                      <span className="modal-bank-name">{bank.name}</span>
                    </div>
                    <div className="helpline-col-numbers">
                      {bank.numbers.map((number, numIndex) => (
                        <div key={numIndex} className="modal-number-line">
                          <span className="modal-phone-number">{number}</span>
                          <div className="modal-actions">
                            <a 
                              href={`tel:${number.replaceAll('-', '')}`} 
                              className="modal-action-btn call-btn"
                              title="Call now"
                            >
                              Call
                            </a>
                            <button 
                              onClick={() => copyToClipboard(number)}
                              className="modal-action-btn copy-btn"
                              title="Copy number"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="modal-instruction">
                Immediately inform your bank and request account or UPI freeze to prevent further loss.
              </p>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setIsHelplineModalOpen(false)}
                className="modal-close-action-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CaseOverview;
