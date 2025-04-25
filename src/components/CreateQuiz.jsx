import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateQuiz.css'; // Import your CSS file

const quizService = {
  async createQuiz(formData) {
    // Simulate an API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!formData.title) {
          reject(new Error('Quiz title is required'));
        } else {
          resolve('Quiz created successfully');
        }
      }, 1000);
    });
  },
};

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    questions: [
      {
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
      },
    ],
    category: '',
    difficulty: 'medium',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === optionIndex ? value : opt
              ),
            }
          : q
      ),
    }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: '',
          options: ['', '', '', ''],
          correctAnswer: '',
        },
      ],
    }));
  };

  const removeQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await quizService.createQuiz(formData);
      alert(result); // Show success message
      navigate('/quizzes');
    } catch (err) {
      setError(err.message || 'Failed to create quiz. Please try again.');
    }
  };

  return (
    <div className="quiz-create">
      <h1>Create New Quiz</h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Quiz Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="timeLimit">Time Limit (minutes)</label>
            <input
              type="number"
              id="timeLimit"
              name="timeLimit"
              value={formData.timeLimit}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="questions-section">
          <h2>Questions</h2>
          {formData.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="question-card">
              <div className="question-header">
                <h3>Question {questionIndex + 1}</h3>
                {formData.questions.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Text</label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) =>
                    handleQuestionChange(questionIndex, 'text', e.target.value)
                  }
                  required
                />
              </div>

              <div className="options-grid">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="form-group">
                    <label>Option {optionIndex + 1}</label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(
                          questionIndex,
                          optionIndex,
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Correct Answer</label>
                <select
                  value={question.correctAnswer}
                  onChange={(e) =>
                    handleQuestionChange(
                      questionIndex,
                      'correctAnswer',
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">Select correct answer</option>
                  {question.options.map((option, index) => (
                    <option key={index} value={option}>
                      {option || `Option ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="add-question-btn"
            onClick={addQuestion}
          >
            Add Question
          </button>
        </div>

        <button type="submit" className="submit-btn btn btn-primary">
          Create Quiz
        </button>
      </form>
    </div>
  );
};

export default CreateQuiz;