import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/welcome.css';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">
          Welcome to <span className="highlight">SmartPlay</span>
        </h1>
        <p className="welcome-description">
          Challenge yourself and others with engaging quizzes. Learn, compete, and
          have fun!
        </p>
        <div className="welcome-features">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Test Your Knowledge</h3>
            <p>Take quizzes on various topics and challenge yourself</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Compete Globally</h3>
            <p>Join the leaderboard and compete with players worldwide</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✍️</div>
            <h3>Create Quizzes</h3>
            <p>Design your own quizzes and share them with the community</p>
          </div>
        </div>
        <div className="welcome-actions">
          {user ? (
            <button
              className="btn btn-primary welcome-button"
              onClick={() => navigate('/main')}
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary welcome-button"
                onClick={() => navigate('/login')}
              >
                Get Started
              </button>
              <button
                className="btn btn-secondary welcome-button"
                onClick={() => navigate('/register')}
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomePage; 