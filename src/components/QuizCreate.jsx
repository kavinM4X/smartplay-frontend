import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizApi } from '../services/api';
import '../styles/quizCreate.css';

const QuizCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'easy',
    timeLimit: 30,
    questions: [
      {
        text: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      }
    ]
  });

  const handleQuizDataChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? {
          ...q,
          options: q.options.map((opt, j) => ({
            ...opt,
            text: j === optionIndex ? value : opt.text
          }))
        } : q
      )
    }));
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? {
          ...q,
          options: q.options.map((opt, j) => ({
            ...opt,
            isCorrect: j === optionIndex
          }))
        } : q
      )
    }));
  };

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      setQuizData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate quiz data
      if (!quizData.title.trim()) {
        throw new Error('Quiz title is required');
      }
      if (!quizData.description.trim()) {
        throw new Error('Quiz description is required');
      }
      if (!quizData.category.trim()) {
        throw new Error('Category is required');
      }

      // Validate questions
      const invalidQuestions = quizData.questions.some(q => 
        !q.text.trim() || 
        q.options.some(opt => !opt.text.trim()) ||
        !q.options.some(opt => opt.isCorrect)
      );

      if (invalidQuestions) {
        throw new Error('All questions must have content, options, and one correct answer');
      }

      // Format the data for the backend
      const formattedData = {
        ...quizData,
        questions: quizData.questions.map(q => ({
          text: q.text.trim(),
          options: q.options.map(opt => ({
            text: opt.text.trim(),
            isCorrect: opt.isCorrect
          }))
        }))
      };

      console.log('Submitting quiz data:', formattedData);
      const response = await quizApi.create(formattedData);
      console.log('Quiz created successfully:', response);
      navigate('/quizzes');
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-create-container">
      <div className="quiz-create-card">
        <h2 className="quiz-create-title">Create New Quiz</h2>
        
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="quiz-create-form">
          <div className="quiz-details-section">
            <div className="form-group">
              <label htmlFor="title">Quiz Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={quizData.title}
                onChange={handleQuizDataChange}
                placeholder="Enter quiz title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={quizData.description}
                onChange={handleQuizDataChange}
                placeholder="Enter quiz description"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={quizData.category}
                  onChange={handleQuizDataChange}
                  placeholder="Enter quiz category"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={quizData.difficulty}
                  onChange={handleQuizDataChange}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="timeLimit">Time Limit (minutes)</label>
                <input
                  type="number"
                  id="timeLimit"
                  name="timeLimit"
                  value={quizData.timeLimit}
                  onChange={handleQuizDataChange}
                  min="1"
                  max="180"
                  required
                />
              </div>
            </div>
          </div>

          <div className="questions-section">
            <div className="questions-header">
              <h3>Questions</h3>
              <button
                type="button"
                className="btn btn-primary"
                onClick={addQuestion}
              >
                Add Question
              </button>
            </div>

            {quizData.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="question-card">
                <div className="question-header">
                  <h4>Question {questionIndex + 1}</h4>
                  {quizData.questions.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Question Text</label>
                  <textarea
                    value={question.text}
                    onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                    placeholder="Enter question text"
                    required
                  />
                </div>

                <div className="options-grid">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="form-group">
                      <label>
                        Option {optionIndex + 1}
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={option.isCorrect}
                          onChange={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                          required
                        />
                      </label>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/quizzes')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Quiz...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizCreate; 