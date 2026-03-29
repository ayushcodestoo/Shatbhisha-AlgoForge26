import React, { useState, useEffect } from 'react';
import { prepareCaseForStorage, generateCaseId } from '../utils/caseAnalytics';

const CaseManager = ({ result, evidenceList, onLoadCase, onNewCase }) => {
  const [cases, setCases] = useState([]);
  const [showCaseList, setShowCaseList] = useState(false);
  const [currentCaseId, setCurrentCaseId] = useState(null);

  // Load cases from localStorage on mount
  useEffect(() => {
    loadCasesFromStorage();
  }, []);

  // Save current case when result or evidence changes
  useEffect(() => {
    if (result && !currentCaseId) {
      // New case detected, generated ID
      const newCaseId = generateCaseId();
      setCurrentCaseId(newCaseId);
      saveCase(newCaseId, result, evidenceList);
    } else if (result && currentCaseId) {
      saveCase(currentCaseId, result, evidenceList);
    }
  }, [result, evidenceList]);

  const loadCasesFromStorage = () => {
    try {
      const stored = localStorage.getItem('cybersaathi_cases');
      const casesList = stored ? JSON.parse(stored) : [];
      setCases(casesList);
    } catch (error) {
      console.error('Error loading cases:', error);
    }
  };

  const saveCase = (caseId, caseResult, caseEvidence) => {
    try {
      const caseData = prepareCaseForStorage(caseResult, caseEvidence, caseId);
      const allCases = cases.filter(c => c.id !== caseId);
      const updatedCases = [{ ...caseData, id: caseId }, ...allCases].slice(0, 20); // Keep last 20
      
      localStorage.setItem('cybersaathi_cases', JSON.stringify(updatedCases));
      setCases(updatedCases);
    } catch (error) {
      console.error('Error saving case:', error);
    }
  };

  const handleLoadCase = (caseId) => {
    const caseToLoad = cases.find(c => c.id === caseId);
    if (caseToLoad) {
      setCurrentCaseId(caseId);
      onLoadCase(caseToLoad);
      setShowCaseList(false);
    }
  };

  const handleDeleteCase = (caseId, e) => {
    e.stopPropagation();
    const updatedCases = cases.filter(c => c.id !== caseId);
    setCases(updatedCases);
    localStorage.setItem('cybersaathi_cases', JSON.stringify(updatedCases));
    
    if (currentCaseId === caseId) {
      setCurrentCaseId(null);
      onNewCase();
    }
  };

  const handleNewCase = () => {
    setCurrentCaseId(null);
    setShowCaseList(false);
    onNewCase();
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN');
  };

  return (
    <div className="case-manager-section">
      <div className="case-controls">
        <button 
          onClick={() => setShowCaseList(!showCaseList)}
          className="btn btn-secondary case-list-toggle"
        >
          Case History ({cases.length})
        </button>
        <button 
          onClick={handleNewCase}
          className="btn btn-primary case-new-btn"
        >
          New Case
        </button>
      </div>

      {showCaseList && cases.length > 0 && (
        <div className="case-list-dropdown">
          <div className="case-list-header">
            Case History - Last {Math.min(cases.length, 10)} Cases
          </div>
          <div className="case-items">
            {cases.slice(0, 10).map(caseItem => (
              <div 
                key={caseItem.id}
                className={`case-item ${currentCaseId === caseItem.id ? 'active' : ''}`}
                onClick={() => handleLoadCase(caseItem.id)}
              >
                <div className="case-item-main">
                  <div className="case-item-type">
                    {caseItem.result.scamTypes?.[0]?.type || 'Unknown'}
                  </div>
                  <div className="case-item-time">
                    {formatDate(caseItem.createdAt)} {formatTime(caseItem.createdAt)}
                  </div>
                </div>
                <div className="case-item-score">
                  Score: {caseItem.result.score}
                </div>
                <button
                  onClick={(e) => handleDeleteCase(caseItem.id, e)}
                  className="case-delete-btn"
                  title="Delete case"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {cases.length === 0 && showCaseList && (
        <div className="case-list-empty">
          No previous cases. Start by analyzing a message.
        </div>
      )}
    </div>
  );
};

export default CaseManager;
