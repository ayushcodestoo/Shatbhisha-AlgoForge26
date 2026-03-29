import React from 'react';

const ConfidenceBreakdown = ({ breakdown }) => {
  if (!breakdown || !breakdown.factors) return null;

  return (
    <div className="confidence-breakdown-card">
      <h3 className="card-title">Confidence Score Breakdown</h3>
      
      <div className="confidence-header">
        <div className="confidence-score">
          Final Score: <strong>{breakdown.finalScore}/100</strong>
        </div>
        <div className="factors-count">
          {breakdown.totalFactorsAnalyzed} factors analyzed
        </div>
      </div>

      <div className="factors-table">
        <table className="breakdown-table">
          <thead>
            <tr>
              <th>Factor</th>
              <th>Contribution</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.factors.map((factor, idx) => (
              <tr key={idx}>
                <td className="factor-name">
                  <span className="factor-icon">{factor.icon}</span>
                  {factor.factor}
                </td>
                <td className="factor-contribution">
                  {factor.contribution}
                </td>
                <td className="factor-details">
                  {factor.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="confidence-note">
        <strong>Note:</strong> Score based on pattern analysis, message content, urgency language, and threat indicators.
      </div>
    </div>
  );
};

export default ConfidenceBreakdown;
