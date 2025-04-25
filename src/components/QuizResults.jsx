import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizApi } from '../services/api';
import '../styles/quizResults.css';

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Sample quiz data for testing
        const sampleQuiz = {
          _id: id,
          title: 'JavaScript Fundamentals',
          description: 'Test your knowledge of JavaScript basics including variables, functions, and control flow.',
          timeLimit: 30,
          questions: [
            {
              question: 'What is JavaScript?',
              options: [
                'A programming language',
                'A markup language',
                'A styling language',
                'A database'
              ],
              correctAnswer: 0,
              points: 10
            },
            {
              question: 'Which of the following is not a JavaScript data type?',
              options: [
                'String',
                'Boolean',
                'Integer',
                'Object'
              ],
              correctAnswer: 2,
              points: 10
            },
            {
              question: 'What is the correct way to declare a variable in JavaScript?',
              options: [
                'var variableName',
                'let variableName',
                'const variableName',
                'All of the above'
              ],
              correctAnswer: 3,
              points: 10
            }
          ],
          difficulty: 'Beginner'
        };

        // Get answers from localStorage
        const answers = JSON.parse(localStorage.getItem(`quiz_${id}_answers`)) || {};
        const timeSpent = parseInt(localStorage.getItem(`quiz_${id}_timeSpent`)) || 0;
        const score = parseInt(localStorage.getItem(`quiz_${id}_score`)) || 0;

        // Calculate results
        let correctCount = 0;
        Object.entries(answers).forEach(([questionIndex, answerIndex]) => {
          if (answerIndex === sampleQuiz.questions[parseInt(questionIndex)].correctAnswer) {
            correctCount++;
          }
        });

        setQuiz(sampleQuiz);
        setScore(score);
        setTotalQuestions(sampleQuiz.questions.length);
        setCorrectAnswers(correctCount);
        setTimeSpent(timeSpent);
        setLoading(false);

        // Clear localStorage
        localStorage.removeItem(`quiz_${id}_answers`);
        localStorage.removeItem(`quiz_${id}_timeSpent`);
        localStorage.removeItem(`quiz_${id}_score`);
      } catch (err) {
        setError('Failed to load results. Please try again later.');
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  const handleRetry = () => {
    navigate(`/quizzes/${id}/attempt`);
  };

  const handleBackToQuizzes = () => {
    navigate('/quizzes');
  };

  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!quiz) {
    return <div className="error">Results not found</div>;
  }

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const timeInMinutes = Math.floor(timeSpent / 60);
  const timeInSeconds = timeSpent % 60;

  return (
    <div className="quiz-results-container">
      <div className="results-header">
        <h1>Quiz Results</h1>
        <h2>{quiz.title}</h2>
      </div>

      <div className="results-summary">
        <div className="score-card">
          <div className="score-circle">
            <span className="score-number">{percentage}%</span>
            <span className="score-label">Score</span>
          </div>
          <div className="score-details">
            <p>Correct Answers: {correctAnswers} / {totalQuestions}</p>
            <p>Points Earned: {score}</p>
            <p>Time Spent: {timeInMinutes}m {timeInSeconds}s</p>
          </div>
        </div>

        <div className="performance-message">
          {percentage >= 80 ? (
            <p className="excellent">Excellent! You've mastered this quiz!</p>
          ) : percentage >= 60 ? (
            <p className="good">Good job! Keep practicing to improve further.</p>
          ) : (
            <p className="needs-improvement">Keep practicing! You can do better!</p>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-primary" onClick={handleRetry}>
          Try Again
        </button>
        <button className="btn btn-secondary" onClick={handleBackToQuizzes}>
          Back to Quizzes
        </button>
      </div>
    </div>
  );
};

export default QuizResults; 