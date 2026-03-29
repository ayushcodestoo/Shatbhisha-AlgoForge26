import React from 'react';

const EvidenceCompleteness = ({ completeness }) => {
  if (!completeness) return null;

  const getStatusColor = (status) => {
    if (status === 'Complete') return '#059669';
    if (status === 'Nearly Complete') return '#0891b2';
    if (status === 'Adequate') return '#d97706';
    if (status === 'Incomplete') return '#f97316';
    return '#dc2626';
  };

  return (
    <div className="evidence-completeness-card">
      <h3 className="card-title">Evidence Completeness</h3>
      
      <div className="completeness-display">
        <div className="completeness-bar-container">
          <div className="completeness-bar">
            <div 
              className="completeness-bar-fill" 
              style={{ 
                width: `${completeness.percentage}%`,
                backgroundColor: getStatusColor(completeness.status)
              }}
            />
          </div>
          <div className="completeness-percentage">
            {completeness.percentage}% ({completeness.collected}/{completeness.required})
          </div>
        </div>

        <div className="completeness-status" style={{ color: getStatusColor(completeness.status) }}>
          {completeness.status}
        </div>

        <p className="completeness-suggestion">
          {completeness.suggestion}
        </p>

        {completeness.missingItems.length > 0 && (
          <div className="missing-items">
            <strong>Recommended to add:</strong>
            <ul className="missing-items-list">
              {completeness.missingItems.map((item, idx) => (
                <li key={idx}>{item.humanReadable}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceCompleteness;
