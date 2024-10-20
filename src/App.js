import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faPaperPlane, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import ResultPage from './ResultPage';

function HomePage() {
  const [review, setReview] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      let response;

      if (audioFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('audio', audioFile);

        response = await axios.post('http://localhost:5000/api/sentiment', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else if (review) {
        response = await axios.post('http://localhost:5000/api/sentiment', { review });
      }

      // Navigate to result page with sentiment data
      if (response) {
        navigate('/result', { state: { sentiment: response.data, review: response.data.review || review } });
      }
    } catch (error) {
      console.error('Error while submitting review or audio:', error);
    } finally {
      setReview('');
      setAudioFile(null);
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-inner">
          <h1 className="app-title">
            <FontAwesomeIcon icon={faCommentDots} /> Sentiment Analysis
          </h1>
          <p className="app-description">Enter your review or upload an audio file:</p>

          {/* Form to input review or upload audio */}
          <form className="review-form" onSubmit={handleSubmit}>
            {/* Wrapper for text input */}
            <div className="input-wrapper">
              <textarea
                className="review-input"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Type your review here"
                disabled={loading || audioFile !== null}
              />
            </div>

            {/* Wrapper for file input */}
            <div className="input-wrapper">
              <input
                className="audio-input"
                type="file"
                accept="audio/mp3"
                onChange={(e) => setAudioFile(e.target.files[0])}
                disabled={loading || review !== ''}
              />
            </div>

            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Analyze'}{' '}
              <FontAwesomeIcon icon={audioFile ? faMicrophone : faPaperPlane} />
            </button>
          </form>
        </div>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </Router>
  );
}

export default App;
