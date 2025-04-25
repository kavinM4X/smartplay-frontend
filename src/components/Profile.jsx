import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi, quizApi } from '../services/api';
import '../styles/profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    averageScore: 0,
    memberSince: ''
  });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || ''
      }));
      
      // Set member since date
      setStats(prev => ({
        ...prev,
        memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
      }));

      // Fetch user's quiz attempts
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const attempts = await quizApi.getUserAttempts();
      
      if (Array.isArray(attempts)) {
        const totalAttempts = attempts.length;
        const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0);
        const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;

        setStats(prev => ({
          ...prev,
          quizzesTaken: totalAttempts,
          averageScore: averageScore
        }));
      }
    } catch (err) {
      console.error('Error fetching user statistics:', err);
      setError('Failed to load user statistics');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error and success messages when user starts typing
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate passwords if trying to change password
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          throw new Error('Current password is required to set a new password');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (formData.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long');
        }
      }

      // Prepare update data
      const updateData = {
        username: formData.username,
        email: formData.email
      };

      // Only include password fields if user is changing password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Send update request
      await authApi.updateProfile(updateData);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="error">Please log in to view your profile</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Profile</h1>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          {isEditing && (
            <>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Required to change password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
              </div>
            </>
          )}

          <div className="profile-actions">
            {!isEditing ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                    setFormData({
                      ...formData,
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>

        <div className="profile-stats">
          <h2>Your Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Quizzes Taken</h3>
              <p>{stats.quizzesTaken}</p>
            </div>
            <div className="stat-card">
              <h3>Average Score</h3>
              <p>{stats.averageScore.toFixed(1)}%</p>
            </div>
            <div className="stat-card">
              <h3>Member Since</h3>
              <p>{stats.memberSince}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 