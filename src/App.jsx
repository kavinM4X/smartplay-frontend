import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import Navigation from './components/Navigation';
import WelcomePage from './components/WelcomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import QuizList from './components/QuizList';
import QuizCreate from './components/QuizCreate';
import QuizAttempt from './components/QuizAttempt';
import Scoreboard from './components/Scoreboard';
import QuizResults from './components/QuizResults';
import Profile from './components/Profile';
import './App.css';
import './styles/global.css';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/main" />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <QuizProvider>
          <div className="app">
            <Navigation />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                <Route path="/main" element={
                  <PrivateRoute>
                    <UserDashboard />
                  </PrivateRoute>
                } />
                
                <Route path="/admin" element={
                  <PrivateRoute adminOnly={true}>
                    <AdminDashboard />
                  </PrivateRoute>
                } />
                
                <Route path="/quizzes" element={
                  <PrivateRoute>
                    <QuizList />
                  </PrivateRoute>
                } />
                
                <Route path="/quizzes/new" element={
                  <PrivateRoute>
                    <QuizCreate />
                  </PrivateRoute>
                } />
                
                <Route path="/quizzes/:id/edit" element={
                  <PrivateRoute>
                    <QuizCreate />
                  </PrivateRoute>
                } />
                
                <Route path="/quizzes/:id/attempt" element={
                  <PrivateRoute>
                    <QuizAttempt />
                  </PrivateRoute>
                } />
                
                <Route path="/quizzes/:id/results" element={<QuizResults />} />
                
                <Route path="/scoreboard" element={<Scoreboard />} />

                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <UserDashboard />
                  </PrivateRoute>
                } />

                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
              </Routes>
            </main>
          </div>
        </QuizProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
