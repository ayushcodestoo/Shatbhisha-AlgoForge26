import React, { useState } from 'react';
import { detectScam } from '../utils/scamDetector';

const Detector = ({ onResult }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDetect = async () => {
    setError('');
    
    if (!inputText.trim()) {
      setError('Please enter a message or link to analyze');
      return;
    }

    if (inputText.trim().length < 10) {
      setError('Please enter at least 10 characters for better analysis');
      return;
    }

    setLoading(true);
    try {
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = detectScam(inputText);
      onResult(result);
    } catch (err) {
      setError('Error analyzing text. Please try again.');
      console.error('Detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      setError('');
    } catch (err) {
      setError('Could not access clipboard. Please check permissions.');
    }
  };

  const handleClear = () => {
    setInputText('');
    setError('');
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleDetect();
    }
  };

  return (
    <div className="detector-hero">
      <div className="detector-hero-content">
        <div className="hero-text-section">
          <h2 className="hero-title">Analyze Suspicious Message or Link</h2>
          <p className="hero-subtitle">Paste SMS, email, link, or phone number for instant risk analysis</p>
        </div>

        <div className="hero-input-wrapper">
          <div className="input-section">
            <textarea
              rows="4"
              placeholder="Paste your message here..."
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              className="input-textarea-hero"
              disabled={loading}
              aria-label="Input text for scam analysis"
            />
            {inputText.trim().length > 0 && (
              <div className="char-count">
                {inputText.trim().length} characters
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="button-group-hero">
            <button 
              onClick={handleDetect}
              disabled={loading || inputText.trim().length === 0}
              className="btn btn-primary btn-large"
              title="Analyze the message (Ctrl+Enter)"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                'Analyze Risk'
              )}
            </button>
            <button 
              onClick={handlePaste}
              disabled={loading}
              className="btn btn-outline btn-large"
              title="Paste from clipboard"
            >
              Paste from Clipboard
            </button>
            {inputText.trim().length > 0 && (
              <button 
                onClick={handleClear}
                disabled={loading}
                className="btn btn-ghost"
                title="Clear the input"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detector;
