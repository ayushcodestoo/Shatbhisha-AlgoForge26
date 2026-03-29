import React, { useState } from 'react';
import { prepareForPortalSubmission } from '../utils/complaintFormatter';

const GuidedComplaintAssistant = ({ result, evidenceList }) => {
  const [copyFeedback, setCopyFeedback] = useState('');
  const [showPortalTip, setShowPortalTip] = useState(false);

  if (!result) {
    return null;
  }

  // Generate minimal details from detection result (no form needed)
  const generatedDetails = {
    incidentDescription: result.text || 'Fraudulent message received',
    dateOfIncident: new Date().toISOString().split('T')[0],
    timeOfIncident: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }).split(' ')[0],
    platformUsed: 'Message/SMS/Chat',
    transactionAmount: '',
    transactionMethod: '',
    suspectName: '',
    suspectPhone: '',
    suspectEmail: '',
    suspectAccount: '',
    additionalNotes: ''
  };

  const submissionData = prepareForPortalSubmission(result, generatedDetails, evidenceList);

  if (!submissionData.success) {
    return (
      <section className="guided-assistant-section">
        <div className="section-header">
          <h2>Guided Complaint Filling</h2>
        </div>
        <div className="validation-error">
          <p className="error-title">Complete the form first</p>
          <ul className="error-list">
            {submissionData.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  const handleCopyField = (text, fieldName) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(`${fieldName} copied!`);
      setTimeout(() => setCopyFeedback(''), 2000);
    }).catch(() => {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(''), 2000);
    });
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(submissionData.complaintText).then(() => {
      setCopyFeedback('Full complaint copied to clipboard!');
      setTimeout(() => setCopyFeedback(''), 3000);
    }).catch(() => {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(''), 2000);
    });
  };

  const handleProceedToPortal = () => {
    setShowPortalTip(true);
    window.open(submissionData.portalUrl, '_blank');
    setTimeout(() => setShowPortalTip(false), 5000);
  };

  return (
    <section className="guided-assistant-section">
      <div className="section-header">
        <h2>Assistive Complaint Filling</h2>
        <p className="section-subtitle">Copy pre-formatted details and paste them into the official cybercrime portal</p>
      </div>

      <div className="assistant-container">
        {/* Quick Action Buttons */}
        <div className="assistant-quick-actions">
          <button 
            className="btn btn-primary btn-copy-all"
            onClick={handleCopyAll}
            title="Copy entire complaint in structured format"
          >
            Copy All Details
          </button>
          <button 
            className="btn btn-primary btn-proceed-portal"
            onClick={handleProceedToPortal}
            title="Open cybercrime.gov.in in new tab"
          >
            Proceed to Portal
          </button>
        </div>

        {/* Feedback Messages */}
        {copyFeedback && (
          <div className="copy-feedback success">
            {copyFeedback}
          </div>
        )}

        {showPortalTip && (
          <div className="portal-tip">
            Paste the copied details into the official complaint form on the portal
          </div>
        )}

        {/* Structured Sections for Copying */}
        <div className="assisted-sections">
          {submissionData.sections.map((section, index) => (
            <div key={index} className="assisted-field-card">
              <div className="field-header">
                <h4 className="field-title">{section.title}</h4>
                <button
                  className="btn-copy-field"
                  onClick={() => handleCopyField(section.value, section.title)}
                  title="Copy this field"
                  aria-label={`Copy ${section.title}`}
                >
                  Copy
                </button>
              </div>

              <div className="field-value-display">
                {section.value.split('\n').map((line, i) => (
                  <div key={i} className="value-line">
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>

              <p className="field-helper-text">{section.helpText}</p>
            </div>
          ))}
        </div>

        {/* Portal Instructions */}
        <div className="portal-instructions-card">
          <h3 className="instructions-title">How to Use This Assistance</h3>
          <ol className="instructions-list">
            <li>
              <strong>Review the fields:</strong> Check all the pre-formatted information below
            </li>
            <li>
              <strong>Copy individual details:</strong> Click "Copy" button on each field you need, then paste in the portal form
            </li>
            <li>
              <strong>Or copy all:</strong> Click "Copy All Details" to copy the entire structured complaint
            </li>
            <li>
              <strong>Open the portal:</strong> Click "Proceed to Portal" to open cybercrime.gov.in
            </li>
            <li>
              <strong>Fill the form:</strong> Paste the copied information into the corresponding fields
            </li>
            <li>
              <strong>Submit the complaint:</strong> Complete any additional fields required by the portal and submit
            </li>
          </ol>
        </div>

        {/* Important Note */}
        <div className="important-note-card">
          <p className="note-title">Important Reminders</p>
          <ul className="note-list">
            <li>File your complaint within 2 hours of discovering the fraud for best recovery chances</li>
            <li>Keep copies of all evidence and the complaint reference number</li>
            <li>Follow up regularly on your complaint status using the reference number</li>
            <li>Also report to your bank or relevant authority immediately if money was transferred</li>
            <li>Block the sender on all platforms to prevent further contact</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default GuidedComplaintAssistant;
