import axios from 'axios';

const API_URL = 'https://smartplay-backend-1.onrender.com/api/auth';//http://localhost:5000/api

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response:', {
        url: error.config.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('API No Response:', error.request);
    } else {
      console.error('API Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Quiz API
export const quizApi = {
  create: async (data) => {
    try {
      console.log('Creating quiz with data:', data);
      // Ensure the data structure matches what the backend expects
      const formattedData = {
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category.trim(),
        difficulty: data.difficulty,
        timeLimit: parseInt(data.timeLimit),
        questions: data.questions.map(q => ({
          text: q.text.trim(),
          options: q.options.map(opt => ({
            text: opt.text.trim(),
            isCorrect: opt.isCorrect
          }))
        }))
      };
      
      console.log('Sending formatted data to server:', formattedData);
      const response = await api.post('/quizzes', formattedData);
      console.log('Quiz created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error in quiz creation:', error);
      throw error;
    }
  },
  getAll: async () => {
    try {
      const response = await api.get('/quizzes');
      console.log('Fetched all quizzes:', response);
      return response;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      console.log('Fetched quiz by id:', response);
      return response;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.put(`/quizzes/${id}`, data);
      console.log('Updated quiz:', response);
      return response;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/quizzes/${id}`);
      console.log('Deleted quiz:', response);
      return response;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },
  submit: async (data) => {
    try {
      // Ensure all required fields are present and properly formatted
      const formattedData = {
        quizId: data.quizId,
        answers: data.answers,
        score: parseInt(data.score),
        timeSpent: parseInt(data.timeSpent),
        percentage: parseInt(data.percentage),
        completedAt: data.completedAt
      };

      console.log('Submitting quiz attempt with data:', formattedData);
      const response = await api.post('/attempts', formattedData);
      console.log('Quiz attempt submitted successfully:', response);
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
  },
  getResults: async (id) => {
    try {
      const response = await api.get(`/quizzes/${id}/results`);
      console.log('Fetched quiz results:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      throw error;
    }
  },
  getUserAttempts: async () => {
    try {
      console.log('Fetching user attempts...');
      const token = localStorage.getItem('token');
      console.log('Auth token present:', !!token);
      
      const response = await api.get('/attempts/user');
      console.log('Raw attempts response:', response);
      
      // Ensure we have a valid response
      if (!response) {
        console.error('No response received from server');
        return [];
      }
      
      // Process the attempts array
      const processAttempts = (attempts) => {
        return attempts.map(attempt => {
          // Ensure all required fields have valid values
          const processedAttempt = {
            ...attempt,
            percentage: Number(attempt.percentage || 0),
            score: Number(attempt.score || 0),
            timeSpent: Number(attempt.timeSpent || 0)
          };

          // Handle quiz data
          if (!attempt.quiz || !attempt.quiz.title) {
            processedAttempt.quiz = {
              title: attempt.quizTitle || attempt.quizName || 'React Quiz',
              ...attempt.quiz
            };
          }

          // Ensure percentage is between 0-100
          processedAttempt.percentage = Math.max(0, Math.min(100, processedAttempt.percentage));
          
          // Ensure score is non-negative
          processedAttempt.score = Math.max(0, processedAttempt.score);
          
          // Ensure timeSpent is at least 1 second
          processedAttempt.timeSpent = Math.max(1, processedAttempt.timeSpent);

          return processedAttempt;
        });
      };

      // Handle both direct array response and response with data property
      if (Array.isArray(response)) {
        return processAttempts(response);
      }
      
      if (response.data && Array.isArray(response.data)) {
        return processAttempts(response.data);
      }
      
      console.error('Unexpected response format:', response);
      return [];
    } catch (error) {
      console.error('Error in getUserAttempts:', error);
      throw error;
    }
  }
};

// User API
export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getQuizzes: (id) => api.get(`/users/${id}/quizzes`),
  getAttempts: (id) => api.get(`/users/${id}/attempts`),
};

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getQuizzes: () => api.get('/admin/quizzes'),
  updateQuiz: (id, data) => api.put(`/admin/quizzes/${id}`, data),
  deleteQuiz: (id) => api.delete(`/admin/quizzes/${id}`),
};

export default api; 
