import React from 'react';

const Timeline = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="timeline-card">
        <div className="card-header">
          <h3>Response Timeline</h3>
        </div>
        <div className="timeline-empty">
          <p>No events yet. Start by analyzing a message.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-card">
      <div className="card-header">
        <h3>Response Timeline</h3>
        <p className="subtitle">{events.length} event{events.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="timeline">
        {events.map((event, i) => (
          <div key={i} className="timeline-item">
            <div className="timeline-marker">
              <div className="timeline-dot" />
              {i < events.length - 1 && <div className="timeline-line" />}
            </div>
            <div className="timeline-content">
              <p className="timeline-event">{event.event}</p>
              <p className="timeline-time">
                {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
