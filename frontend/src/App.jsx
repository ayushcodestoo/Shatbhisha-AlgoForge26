import React, { useState, useEffect } from 'react';
import Detector from './components/Detector';
import UrgencyIndicator from './components/UrgencyIndicator';
import CaseOverview from './components/CaseOverview';
import ActionPanel from './components/ActionPanel';
import AuthorityRoute from './components/AuthorityRoute';
import EvidenceUpload from './components/EvidenceUpload';
import Timeline from './components/Timeline';
import ComplaintGen from './components/ComplaintGen';
import GuidedComplaintAssistant from './components/GuidedComplaintAssistant';
import Analytics from './components/Analytics';
import CaseManager from './components/CaseManager';
import './index.css';

function App() {
  const [result, setResult] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [detectionTime, setDetectionTime] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleDetect = (detectionResult) => {
    setResult(detectionResult);
    setDetectionTime(new Date().toISOString());
    
    // Add to timeline
    const scamTypeLabel = detectionResult.scamTypes?.length > 0
      ? detectionResult.scamTypes[0].type
      : 'Message analyzed';
    
    setTimeline(prev => [...prev, {
      event: `Analysis: ${scamTypeLabel} - Risk Score ${detectionResult.score}/100`,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleLoadCase = (caseData) => {
    setResult(caseData.result);
    setEvidenceList(caseData.evidenceList);
    setTimeline([{
      event: 'Case loaded from history',
      timestamp: new Date().toISOString()
    }]);
    setDetectionTime(caseData.createdAt);
  };

  const handleNewCase = () => {
    handleReset();
  };

  const handleAddEvidence = (evidence) => {
    setEvidenceList(prev => [...prev, evidence]);
    setTimeline(prev => [...prev, {
      event: `Evidence uploaded: ${evidence.originalName}`,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleReset = () => {
    setResult(null);
    setEvidenceList([]);
    setTimeline([]);
    setDetectionTime(null);
    const textarea = document.querySelector('.input-textarea');
    if (textarea) textarea.value = '';
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <h1 className="app-title">CyberSaathi</h1>
            <p className="app-subtitle">Cybercrime Response & Risk Analysis Platform</p>
          </div>
          <div className="header-right">
            <button 
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            {result && (
              <button onClick={handleReset} className="btn btn-outline btn-sm">
                + New Case
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="max-width-container">
          {/* ===== SECTION 1: INPUT - Message Detection ===== */}
          <section className="detector-section">
            <Detector onResult={handleDetect} />
          </section>

          {/* ===== RESULTS FLOW (shown after detection) ===== */}
          {result && (
            <>
              {/* ===== SECTION 2: DETECTION RESULT (PROMINENT) ===== */}
              <CaseOverview 
                result={result} 
                evidenceList={evidenceList}
                hasEvidence={evidenceList.length > 0}
              />

              {/* ===== SECTION 3: REPORT & TAKE ACTION (HIGH PRIORITY) ===== */}
              <section className="report-action-section">
                <div className="section-header">
                  <h2>Report & Take Action</h2>
                  <p className="section-description">
                    Immediate reporting improves chances of recovery. Recommended within 2 hours.
                  </p>
                </div>

                <div className="action-panels-grid">
                  <ActionPanel 
                    scamTypes={result.scamTypes} 
                    score={result.score} 
                    complaintText={`SCAM ALERT - ${result.urgencyLevel}\n\nOriginal Message:\n${result.originalText}\n\nDetected Scam Types: ${result.scamTypes.map(s => s.type).join(', ')}\nTrust Score: ${result.score}/100\n\nIMPORTATE ACTIONS:\n1. Do not respond to the message\n2. Do not share any personal details\n3. Block the sender immediately\n4. Report to relevant authorities within 2 hours\n5. Contact your bank if financial transactions are involved`}
                  />
                  <AuthorityRoute scamTypes={result.scamTypes} score={result.score} />
                </div>
              </section>

              {/* ===== SECTION 4: EXPLANATION (SHORT & CLEAR) ===== */}
              {/* This is part of CaseOverview already, shown above */}

              {/* ===== SECTION 5: EVIDENCE UPLOAD ===== */}
              <section className="evidence-section">
                <EvidenceUpload onUpload={handleAddEvidence} evidenceList={evidenceList} />
              </section>

              {/* ===== SECTION 6: TIMELINE / RESPONSE STEPS ===== */}
              <section className="timeline-section">
                <Timeline events={timeline} />
              </section>

              {/* ===== SECTION 7: COMPLAINT MANAGEMENT ===== */}
              <section className="complaint-management-section">
                <div className="section-header">
                  <h2>Complaint Generation & Assistance</h2>
                </div>

                <div className="complaint-panels">
                  <ComplaintGen result={result} evidence={evidenceList} />

                  <GuidedComplaintAssistant
                    result={result}
                    evidenceList={evidenceList}
                  />
                </div>
              </section>

              {/* ===== SECTION 8: ANALYTICS (MINIMAL, LAST) ===== */}
              <section className="analytics-section">
                <Analytics />
              </section>
            </>
          )}

          {/* ===== CASE MANAGER (Optional, outside main flow) ===== */}
          {result && (
            <div className="case-manager-section">
              <CaseManager 
                result={result} 
                evidenceList={evidenceList}
                onLoadCase={handleLoadCase}
                onNewCase={handleNewCase}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 CyberSaathi | Cybercrime Awareness & Response Tool</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
