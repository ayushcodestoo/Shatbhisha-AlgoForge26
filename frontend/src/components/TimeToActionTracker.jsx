import React, { useState, useEffect } from 'react';
import { getTimeToActionData } from '../utils/caseAnalytics';

const TimeToActionTracker = ({ detectionTimeISO }) => {
  const [timeData, setTimeData] = useState(null);

  useEffect(() => {
    if (!detectionTimeISO) return;

    // Update immediately and then every 10 seconds
    const updateTime = () => {
      const data = getTimeToActionData(detectionTimeISO);
      setTimeData(data);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);

    return () => clearInterval(interval);
  }, [detectionTimeISO]);

  if (!timeData) return null;

  const getUrgencyStyle = () => {
    switch (timeData.urgencyLevel) {
      case 'critical':
        return { backgroundColor: '#fecaca', borderLeftColor: '#dc2626' };
      case 'expired':
        return { backgroundColor: '#fed7aa', borderLeftColor: '#d97706' };
      case 'high':
        return { backgroundColor: '#fed7aa', borderLeftColor: '#d97706' };
      default:
        return { backgroundColor: '#d1fae5', borderLeftColor: '#059669' };
    }
  };

  return (
    <div className="time-to-action-card">
      <h3 className="card-title">Action Timeline</h3>
      
      <div className="time-display">
        <div className="time-elapsed">
          <span className="time-label">Detection:</span>
          <span className="time-value">{timeData.detectionTime}</span>
        </div>
        <div className="time-remaining">
          <span className="time-label">Recovery Window Remaining:</span>
          <span className="time-value">{timeData.remainingMinutes}m</span>
        </div>
      </div>

      <div 
        className="urgency-alert"
        style={getUrgencyStyle()}
      >
        <p className="urgency-message">
          {timeData.urgencyMessage}
        </p>
      </div>

      <div className="action-timeline">
        <div className="timeline-markers">
          <div className="milestone">
            <div className="milestone-label">30 min (Best)</div>
            <div className="milestone-badge" style={{ backgroundColor: '#059669' }} />
          </div>
          <div className="milestone">
            <div className="milestone-label">2 hours (Critical)</div>
            <div className="milestone-badge" style={{ backgroundColor: '#d97706' }} />
          </div>
          <div className="milestone">
            <div className="milestone-label">24 hours (Possible)</div>
            <div className="milestone-badge" style={{ backgroundColor: '#dc2626' }} />
          </div>
        </div>
      </div>

      <div className="timeline-note">
        Recovery chances decrease significantly after 2 hours. Immediate action is critical.
      </div>
    </div>
  );
};

export default TimeToActionTracker;
