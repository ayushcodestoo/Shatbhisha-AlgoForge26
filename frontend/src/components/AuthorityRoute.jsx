import React from 'react';
import { getAuthorityRouting } from '../utils/scamDetector';

const AuthorityRoute = ({ scamTypes, score }) => {
  const routing = getAuthorityRouting(scamTypes);

  return (
    <div className="routing-card">
      <div className="card-header">
        <h3>Authority & Reporting Steps</h3>
      </div>

      <div className="authority-box">
        <h4>Report to: <span style={{ color: '#3b82f6' }}>{routing.authority}</span></h4>
        <p className="urgency-note">{routing.urgencyText}</p>
      </div>

      <div className="steps-list">
        {routing.steps.map((step, i) => (
          <div key={i} className="step-item">
            <span className="step-number">{i + 1}</span>
            <span className="step-text">{step}</span>
          </div>
        ))}
      </div>

      <div className="helpline-box">
        <h4>📞 Quick Helplines:</h4>
        <ul className="helplines">
          <li>🚨 Cybercrime Helpline: <strong>1930</strong></li>
          <li>🏦 All Bank Helplines: Find on your card</li>
          <li>🔗 cybercrime.gov.in - Online complaint</li>
          <li>📱 Local Police: Dial 100</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthorityRoute;
