import React from 'react';

const CaseStrengthScore = ({ score, breakdown }) => {
  if (!score) return null;

  const getStrengthColor = (scoreValue) => {
    if (scoreValue >= 85) return '#059669';
    if (scoreValue >= 70) return '#0891b2';
    if (scoreValue >= 55) return '#d97706';
    if (scoreValue >= 40) return '#f97316';
    return '#dc2626';
  };

  const getStrengthLabel = (scoreValue) => {
    if (scoreValue >= 85) return 'Extremely Strong';
    if (scoreValue >= 70) return 'Very Strong';
    if (scoreValue >= 55) return 'Strong';
    if (scoreValue >= 40) return 'Moderate';
    if (scoreValue >= 25) return 'Weak';
    return 'Very Weak';
  };

  const color = getStrengthColor(score);

  return (
    <div className="case-strength-card">
      <h3 className="card-title">Case Strength Assessment</h3>
      
      <div className="strength-gauge-container">
        <div className="strength-score-display">
          <div className="score-circle" style={{ borderColor: color }}>
            <span className="score-value">{score}</span>
            <span className="score-label">/100</span>
          </div>
          <div className="strength-info">
            <div className="strength-label" style={{ color: color }}>
              {getStrengthLabel(score)}
            </div>
            <div className="strength-bar">
              <div 
                className="strength-bar-fill" 
                style={{ 
                  width: `${score}%`, 
                  backgroundColor: color 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {breakdown && (
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <span className="breakdown-label">Trust Score</span>
            <span className="breakdown-value">{breakdown.trustScore}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Evidence</span>
            <span className="breakdown-value">{breakdown.evidenceScore}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Indicators</span>
            <span className="breakdown-value">{breakdown.indicatorScore}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Urgency</span>
            <span className="breakdown-value">{breakdown.urgencyScore}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseStrengthScore;
