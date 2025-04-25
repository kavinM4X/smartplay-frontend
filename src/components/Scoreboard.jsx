import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizApi } from '../services/api';
import '../styles/scoreboard.css';

const Scoreboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttempts = async () => {
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching attempts for user:', user?._id);
        
        const response = await quizApi.getUserAttempts();
        console.log('Raw response from getUserAttempts:', response);
        
        if (!response) {
          throw new Error('No response received');
        }
        
        // Process and validate attempts
        const validAttempts = Array.isArray(response) ? response.filter(attempt => {
          const isValid = attempt && 
            attempt._id && 
            typeof attempt.percentage === 'number' &&
            typeof attempt.score === 'number' &&
            typeof attempt.timeSpent === 'number';
            
          if (!isValid) {
            console.warn('Invalid attempt data:', attempt);
          }
          return isValid;
        }) : [];
        
        // Sort attempts by completion date, most recent first
        const sortedAttempts = validAttempts.sort((a, b) => 
          new Date(b.completedAt) - new Date(a.completedAt)
        );
        
        console.log('Processed attempts:', sortedAttempts);
        setAttempts(sortedAttempts);
        setLoading(false);
        
        if (sortedAttempts.length === 0) {
          setError('No quiz attempts found.');
        }
      } catch (err) {
        console.error('Error fetching attempts:', err);
        setError(err.message || 'Failed to load scores. Please try again later.');
        setAttempts([]);
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [user, isAuthenticated, navigate]);

  const getPerformanceClass = (percentage) => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'fair';
    return 'poor';
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 80) return 'Excellent!';
    if (percentage >= 60) return 'Good Job!';
    if (percentage >= 40) return 'Fair';
    return 'Keep Practicing!';
  };

  if (loading) {
    return <div className="loading">Loading scores...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="error-container">
        <p>Please log in to view your scores.</p>
        <Link to="/login" className="btn btn-primary">
          Login
        </Link>
      </div>
    );
  }

  if (error && attempts.length === 0) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <Link to="/quizzes" className="btn btn-primary">
          Take a Quiz
        </Link>
      </div>
    );
  }

  return (
    <div className="scoreboard-container">
      <h1>Your Quiz Scores</h1>
      
      <div className="scores-list">
        {attempts.map((attempt) => {
          // Calculate performance class and message
          const percentage = Math.max(0, Math.min(100, attempt.percentage || 0));
          const performanceClass = getPerformanceClass(percentage);
          const performanceMessage = getPerformanceMessage(percentage);
          
          // Format time
          const minutes = Math.floor((attempt.timeSpent || 0) / 60);
          const seconds = (attempt.timeSpent || 0) % 60;
          const timeDisplay = `${minutes}m ${seconds}s`;
          
          // Get quiz title
          const quizTitle = attempt.quiz?.title || 'Quiz';
          
          return (
            <div key={attempt._id} className="score-card">
              <div className="score-header">
                <h3>{quizTitle}</h3>
                <span className="score-date">
                  {new Date(attempt.completedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="score-details">
                <div className="score-item">
                  <span className="label">Score:</span>
                  <span className="value">{percentage}%</span>
                </div>
                <div className="score-item">
                  <span className="label">Points:</span>
                  <span className="value">{attempt.score}</span>
                </div>
                <div className="score-item">
                  <span className="label">Time:</span>
                  <span className="value">{timeDisplay}</span>
                </div>
              </div>
              <div className={`performance-indicator ${performanceClass}`}>
                {performanceMessage}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Scoreboard; 