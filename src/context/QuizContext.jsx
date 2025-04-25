import { createContext, useState, useContext } from 'react';
import { quizApi } from '../services/api';

const QuizContext = createContext(null);

export const QuizProvider = ({ children }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizApi.getAll();
      setQuizzes(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load quizzes');
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quizId) => {
    try {
      setLoading(true);
      const response = await quizApi.getById(quizId);
      const quiz = response.data;
      setCurrentQuiz(quiz);
      setCurrentAttempt({
        quizId: quiz._id,
        answers: [],
        startTime: new Date(),
        timeRemaining: quiz.timeLimit * 60, // Convert minutes to seconds
      });
      setError(null);
    } catch (err) {
      setError('Failed to start quiz');
      console.error('Error starting quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = (questionIndex, selectedOption) => {
    if (!currentAttempt) return;

    setCurrentAttempt((prev) => ({
      ...prev,
      answers: [
        ...prev.answers.filter((a) => a.questionIndex !== questionIndex),
        { questionIndex, selectedOption },
      ],
    }));
  };

  const submitQuiz = async () => {
    if (!currentAttempt || !currentQuiz) return;

    try {
      setLoading(true);
      const timeTaken = Math.round(
        (new Date() - new Date(currentAttempt.startTime)) / 1000
      );

      const response = await quizApi.submit(currentQuiz._id, {
        answers: currentAttempt.answers,
        timeTaken,
      });

      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to submit quiz');
      console.error('Error submitting quiz:', err);
      return null;
    } finally {
      setLoading(false);
      endQuiz();
    }
  };

  const endQuiz = () => {
    setCurrentQuiz(null);
    setCurrentAttempt(null);
  };

  return (
    <QuizContext.Provider
      value={{
        quizzes,
        currentQuiz,
        currentAttempt,
        loading,
        error,
        fetchQuizzes,
        startQuiz,
        submitAnswer,
        submitQuiz,
        endQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export default QuizContext; 