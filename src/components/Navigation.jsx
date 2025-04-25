import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          SmartPlay
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <Link to="/main" className="nav-link">
                Home
              </Link>
              <Link to="/quizzes" className="nav-link">
                Quizzes
              </Link>
              <Link to="/quizzes/new" className="nav-link">
                Create Quiz
              </Link>
              <Link to="/scoreboard" className="nav-link">
                My Scores
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <button onClick={handleLogout} className="nav-button btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-button btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 