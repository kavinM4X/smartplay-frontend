import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const quizService = {
  async getAllQuizzes() {
    try {
      const response = await axios.get(`${API_URL}/quizzes`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getQuizById(id) {
    try {
      const response = await axios.get(`${API_URL}/quizzes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createQuiz(quizData) {
    try {
      const response = await axios.post(`${API_URL}/quizzes`, quizData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async updateQuiz(id, quizData) {
    try {
      const response = await axios.put(`${API_URL}/quizzes/${id}`, quizData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async deleteQuiz(id) {
    try {
      const response = await axios.delete(`${API_URL}/quizzes/${id}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async submitQuizAttempt(quizId, attemptData) {
    try {
      const response = await axios.post(
        `${API_URL}/attempts/${quizId}`,
        attemptData,
        {
          headers: getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getQuizAttempts(quizId) {
    try {
      const response = await axios.get(`${API_URL}/attempts/${quizId}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getUserAttempts() {
    try {
      const response = await axios.get(`${API_URL}/attempts/user`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getLeaderboard() {
    try {
      const response = await axios.get(`${API_URL}/quizzes/leaderboard`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default quizService; 