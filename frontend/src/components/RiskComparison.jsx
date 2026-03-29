import React from 'react';

const RiskComparison = ({ riskComparison }) => {
  if (!riskComparison) return null;

  const getRiskColor = (riskLevel) => {
    if (riskLevel === 'significantly_higher') return '#dc2626';
    if (riskLevel === 'higher') return '#f97316';
    if (riskLevel === 'typical') return '#0891b2';
    if (riskLevel === 'lower') return '#d97706';
    return '#059669';
  };

  const getRiskIndicator = (riskLevel) => {
    if (riskLevel === 'significantly_higher') return '↑↑ Much Riskier';
    if (riskLevel === 'higher') return '↑ Riskier';
    if (riskLevel === 'typical') return '= Typical Risk';
    if (riskLevel === 'lower') return '↓ Less Risky';
    return '↓↓ Much Safer';
  };

  const color = getRiskColor(riskComparison.riskLevel);

  return (
    <div className="risk-comparison-card">
      <h3 className="card-title">Risk Assessment</h3>
      
      <div className="risk-comparison-display">
        <div className="risk-comparison-row">
          <div className="risk-metric">
            <span className="metric-label">This Case</span>
            <span className="metric-value" style={{ color: '#2563eb' }}>
              {riskComparison.current}/100
            </span>
          </div>
          <div className="risk-separator">vs</div>
          <div className="risk-metric">
            <span className="metric-label">Typical Case</span>
            <span className="metric-value" style={{ color: '#6b7280' }}>
              {riskComparison.baseline}/100
            </span>
          </div>
        </div>

        <div className="risk-comparison-message" style={{ color: color }}>
          <strong>
            {getRiskIndicator(riskComparison.riskLevel)}
          </strong>
          <p style={{ color: color, marginTop: '0.5rem' }}>
            {riskComparison.comparison}
          </p>
        </div>

        <div className="risk-timeline">
          <div className="timeline-start" style={{ opacity: 0.5 }}>
            Lower Risk
          </div>
          <div className="timeline-end" style={{ opacity: 0.5 }}>
            Higher Risk
          </div>
          <div 
            className="timeline-marker" 
            style={{ 
              left: `${Math.min(riskComparison.percentilRank, 100)}%`,
              backgroundColor: color
            }}
            title={`Risk Level: ${riskComparison.percentilRank}%`}
          />
        </div>
      </div>
    </div>
  );
};

export default RiskComparison;
