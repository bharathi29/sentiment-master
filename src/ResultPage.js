import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './App.css'; // Add necessary CSS styling if needed

function ResultPage() {
  const location = useLocation();
  const { sentiment, review } = location.state || {}; // Get both sentiment and review from state

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-inner">
          <h1 className="app-title">Sentiment Analysis Result</h1>

          {/* Display sentiment result */}
          {sentiment ? (
            <div className="sentiment-result">
              <p><strong>Review:</strong> {review}</p> {/* Display the original review or transcribed text */}
              <p><strong>Sentiment Label:</strong> {sentiment.label}</p> {/* Display the sentiment label */}
              <p><strong>Sentiment Score:</strong> {sentiment.score}</p> {/* Display the sentiment score */}
            </div>
          ) : (
            <p>No sentiment data available.</p>
          )}

          {/* Link to go back to the home page */}
          <Link to="/" className="back-link">Analyze Another Review</Link>
        </div>
      </header>
    </div>
  );
}

export default ResultPage;
