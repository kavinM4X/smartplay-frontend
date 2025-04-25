import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizApi } from '../services/api';
import '../styles/quizAttempt.css';

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(20); // 20 seconds per question
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        if (!user) {
          setError('Please log in to take the quiz');
          setLoading(false);
          return;
        }

        // Fetch the specific quiz by ID
        try {
          const quiz = await quizApi.getById(id);
          console.log('Fetched quiz:', quiz);
          
          if (!quiz) {
            setError('Quiz not found');
            setLoading(false);
            return;
          }

          setQuiz(quiz);
          setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
          setLoading(false);
        } catch (error) {
          console.error('Error fetching quiz:', error);
          setError('Failed to load quiz. Please try again later.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in quiz attempt:', err);
        setError('Failed to load quiz. Please try again later.');
        setLoading(false);
      }
    };

    if (user && id) {
      fetchQuiz();
    }
  }, [user, id]); // Added id dependency

  // Main quiz timer
  useEffect(() => {
    if (!timeLeft || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  // Question timer
  useEffect(() => {
    if (!questionTimer || isSubmitted) return;

    const timer = setInterval(() => {
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questionTimer, isSubmitted]);

  const handleAnswer = async (answerIndex) => {
    if (isSubmitted) return;

    const currentQuestionData = quiz.questions[currentQuestion];
    const selectedOption = currentQuestionData.options[answerIndex];
    const isCorrectAnswer = selectedOption.isCorrect;
    
    // Play sound based on answer correctness
    if (isCorrectAnswer) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
    
    setIsCorrect(isCorrectAnswer);

    // Record answer first
    const newAnswers = {
      ...answers,
      [currentQuestion]: {
        questionIndex: currentQuestion,
        selectedOption: answerIndex,
        isCorrect: isCorrectAnswer
      }
    };
    setAnswers(newAnswers);

    // Calculate score for correct answers
    if (isCorrectAnswer) {
      const basePoints = 10; // Base points per question
      const timeBonus = Math.floor(questionTimer / 4); // Bonus points based on remaining time
      const pointsEarned = basePoints + timeBonus;
      
      // Update score state
      setScore(prevScore => {
        const newScore = prevScore + pointsEarned;
        return newScore;
      });
    }

    // Move to next question after showing feedback
    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setQuestionTimer(20); // Reset question timer
        setIsCorrect(null);
      }
    }, 1000);
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;

    // Check if all questions are answered
    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions < quiz.questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitted(true);
    try {
      // Format answers for API
      const formattedAnswers = Object.values(answers).map(answer => ({
        questionIndex: answer.questionIndex,
        selectedOption: answer.selectedOption,
        isCorrect: answer.isCorrect
      }));

      // Calculate final scores
      const timeSpent = Math.max(1, quiz.timeLimit * 60 - timeLeft);
      const totalPossibleScore = quiz.questions.length * 10;
      const finalScore = Math.max(0, score);
      const percentage = Math.max(0, Math.min(100, Math.round((finalScore / totalPossibleScore) * 100)));

      const attemptData = {
        quizId: quiz._id,
        answers: formattedAnswers,
        score: finalScore,
        timeSpent: timeSpent,
        percentage: percentage,
        completedAt: new Date().toISOString()
      };

      const response = await quizApi.submit(attemptData);
      console.log('Final submission successful:', response);

      // Navigate to scoreboard and force a reload
      navigate('/scoreboard', { replace: true });
      window.location.reload();
    } catch (err) {
      console.error('Quiz submission error:', err);
      setError('Failed to submit quiz. Please try again.');
      setIsSubmitted(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(prev => prev + 1);
    setQuestionTimer(20); // Reset question timer
    setIsCorrect(null);
  };

  // Sound effects
  const playCorrectSound = async () => {
    try {
      const audio = new Audio('/sounds/correct.mp3');
      await audio.load(); // Ensure audio is loaded before playing
      await audio.play().catch(error => {
        console.log('Sound playback failed:', error);
      });
    } catch (error) {
      console.log('Error playing correct sound:', error);
    }
  };

  const playIncorrectSound = async () => {
    try {
      const audio = new Audio('/sounds/incorrect.mp3');
      await audio.load(); // Ensure audio is loaded before playing
      await audio.play().catch(error => {
        console.log('Sound playback failed:', error);
      });
    } catch (error) {
      console.log('Error playing incorrect sound:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading quiz...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!quiz) {
    return <div className="error">Quiz not found</div>;
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="quiz-attempt-container">
      <div className="quiz-header">
        <h1>{quiz.title}</h1>
        <div className="quiz-timers">
          <div className="timer main-timer">
            <span>Time Left:</span>
            <span className={timeLeft <= 30 ? 'warning' : ''}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="timer question-timer">
            <span>Question Time:</span>
            <span className={questionTimer <= 5 ? 'warning' : ''}>
              {questionTimer}s
            </span>
          </div>
        </div>
      </div>

      <div className="quiz-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
        <span className="progress-text">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </span>
      </div>

      <div className="question-container">
        <h2 className="question-text">
          {quiz.questions[currentQuestion].text}
        </h2>
        <div className="options-grid">
          {quiz.questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${
                answers[currentQuestion]?.selectedOption === index
                  ? answers[currentQuestion].isCorrect
                    ? 'correct'
                    : 'incorrect'
                  : ''
              }`}
              onClick={() => handleAnswer(index)}
              disabled={isSubmitted || answers[currentQuestion] !== undefined}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-footer">
        <div className="score-display">
          Current Score: <span className="score">{score}</span>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="quiz-controls">
          {currentQuestion < quiz.questions.length - 1 ? (
            <span className="questions-remaining">
              {quiz.questions.length - currentQuestion - 1} questions remaining
            </span>
          ) : (
            <button
              className="btn btn-primary submit-button"
              onClick={handleSubmit}
              disabled={isSubmitted || Object.keys(answers).length < quiz.questions.length}
            >
              {isSubmitted ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt; 