import React from 'react';

const UrgencyIndicator = ({ score, urgencyLevel }) => {
  const getColor = () => {
    if (score <= 30) return '#dc2626'; // Red
    if (score <= 60) return '#d97706'; // Orange
    return '#059669'; // Green
  };

  const getLabel = () => {
    if (score <= 30) return 'HIGH RISK';
    if (score <= 60) return 'MEDIUM RISK';
    return 'LOW RISK';
  };

  const getRecoveryMessage = () => {
    if (score <= 30) return 'Action required within 30-60 minutes';
    if (score <= 60) return 'Verification recommended before responding';
    return 'Message appears legitimate - exercise normal caution';
  };

  return (
    <div className="urgency-card">
      <div className="urgency-header">
        <h3>Risk Assessment</h3>
      </div>

      <div className="score-display" style={{ borderColor: getColor() }}>
        <div className="score-number" style={{ color: getColor() }}>
          {score}
        </div>
        <div className="score-label" style={{ color: getColor() }}>
          {getLabel()}
        </div>
      </div>

      <div className="urgency-message">
        <span style={{ color: getColor(), fontWeight: 700 }}>
          {getRecoveryMessage()}
        </span>
      </div>

      <div className="recovery-note">
        <p className="recovery-text">
          <strong>Critical Timeline:</strong> For fraud cases, reporting to authorities within 2 hours significantly improves recovery outcomes.
        </p>
      </div>
    </div>
  );
};

export default UrgencyIndicator;
