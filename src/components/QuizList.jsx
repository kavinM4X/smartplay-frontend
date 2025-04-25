import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizApi } from '../services/api';
import '../styles/quizList.css';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const location = useLocation();

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching quizzes...');
      const response = await quizApi.getAll();
      console.log('Raw API response:', response);
      
      if (Array.isArray(response)) {
        // Sort quizzes by creation date (newest first)
        const sortedQuizzes = response.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        console.log('Setting sorted quizzes:', sortedQuizzes);
        setQuizzes(sortedQuizzes);
      } else {
        console.error('Unexpected response format:', response);
        setError('Failed to load quizzes: Invalid response format');
      }
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setError('Failed to load quizzes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch quizzes when component mounts or location changes
  useEffect(() => {
    console.log('QuizList mounted or location changed');
    fetchQuizzes();
  }, [location.key]);

  if (loading) {
    return <div className="loading">Loading quizzes...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="quiz-list-page">
      <div className="quiz-list-header">
        <h1>Available Quizzes</h1>
        <div className="header-actions">
          <button onClick={fetchQuizzes} className="btn btn-secondary">
            Refresh
          </button>
          {user && (
            <Link to="/create-quiz" className="btn btn-primary">
              Create New Quiz
            </Link>
          )}
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="no-quizzes">
          <p>No quizzes available at the moment.</p>
          {user && (
            <Link to="/create-quiz" className="btn btn-primary">
              Create Your First Quiz
            </Link>
          )}
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <div className="quiz-meta">
                <span>Time: {quiz.timeLimit} minutes</span>
                <span>Questions: {quiz.questions?.length || 0}</span>
                <span className={`difficulty ${quiz.difficulty?.toLowerCase()}`}>
                  Level: {quiz.difficulty}
                </span>
                <span>Category: {quiz.category}</span>
              </div>
              <div className="quiz-actions">
                <Link 
                  to={`/quizzes/${quiz._id}/attempt`} 
                  className="btn btn-primary"
                >
                  Take Quiz
                </Link>
                {user && user._id === quiz.creator?._id && (
                  <Link 
                    to={`/quiz/${quiz._id}/edit`} 
                    className="btn btn-secondary"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList; 