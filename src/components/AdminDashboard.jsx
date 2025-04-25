import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import quizService from '../services/quizService';
import '../styles/adminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalAttempts: 0,
    recentUsers: [],
    recentQuizzes: [],
    recentAttempts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await quizService.getAdminStats();
        setStats(response);
      } catch (err) {
        setError('Failed to load admin statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Quizzes</h3>
          <p className="stat-value">{stats.totalQuizzes}</p>
        </div>
        <div className="stat-card">
          <h3>Total Attempts</h3>
          <p className="stat-value">{stats.totalAttempts}</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="recent-section">
          <h2>Recent Users</h2>
          <div className="list-container">
            {stats.recentUsers.map((user) => (
              <div key={user._id} className="list-item">
                <div>
                  <h4>{user.username}</h4>
                  <p>{user.email}</p>
                </div>
                <span className="date">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="recent-section">
          <h2>Recent Quizzes</h2>
          <div className="list-container">
            {stats.recentQuizzes.map((quiz) => (
              <div key={quiz._id} className="list-item">
                <div>
                  <h4>{quiz.title}</h4>
                  <p>{quiz.category}</p>
                </div>
                <span className="date">
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="recent-section">
          <h2>Recent Attempts</h2>
          <div className="list-container">
            {stats.recentAttempts.map((attempt) => (
              <div key={attempt._id} className="list-item">
                <div>
                  <h4>{attempt.user.username}</h4>
                  <p>{attempt.quiz.title}</p>
                </div>
                <span className="score">Score: {attempt.score}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard; 