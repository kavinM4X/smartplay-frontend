import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import quizService from '../services/quizService';
import '../styles/userDashboard.css';

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    completedQuizzes: [],
    recentAttempts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        const attempts = await quizService.getUserAttempts();
        const totalAttempts = attempts.length;
        const averageScore = totalAttempts
          ? attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts
          : 0;
        
        setStats({
          totalAttempts,
          averageScore,
          completedQuizzes: [...new Set(attempts.map(a => a.quiz))],
          recentAttempts: attempts.slice(0, 5),
        });
      } catch (err) {
        setError('Failed to load user statistics');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserStats();
    }
  }, [user]);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" />;
  }

  if (authLoading || loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username || 'User'}!</h1>
        <Link to="/quizzes" className="btn btn-primary">
          Take New Quiz
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Attempts</h3>
          <p className="stat-value">{stats.totalAttempts}</p>
        </div>
        <div className="stat-card">
          <h3>Average Score</h3>
          <p className="stat-value">{stats.averageScore.toFixed(1)}%</p>
        </div>
        <div className="stat-card">
          <h3>Completed Quizzes</h3>
          <p className="stat-value">{stats.completedQuizzes.length}</p>
        </div>
      </div>

      <div className="recent-attempts">
        <h2>Recent Attempts</h2>
        {stats.recentAttempts.length === 0 ? (
          <p className="no-attempts">You haven't attempted any quizzes yet.</p>
        ) : (
          <div className="attempts-list">
            {stats.recentAttempts.map((attempt) => (
              <div key={attempt._id} className="attempt-card">
                <div className="attempt-info">
                  <h3>{attempt.quiz?.title || 'Untitled Quiz'}</h3>
                  <p>Category: {attempt.quiz?.category || 'N/A'}</p>
                  <p>Date: {new Date(attempt.completedAt).toLocaleDateString()}</p>
                </div>
                <div className="attempt-score">
                  <span className="score">{attempt.score}%</span>
                  <span className="status">
                    {attempt.score >= 70 ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 