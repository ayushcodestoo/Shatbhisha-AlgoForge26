import React from 'react';

const IncidentSummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="incident-summary-card">
      <h3 className="card-title">Incident Summary</h3>
      <div className="summary-content">
        <p className="summary-text">{summary}</p>
      </div>
    </div>
  );
};

export default IncidentSummary;
