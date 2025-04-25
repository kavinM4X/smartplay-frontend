import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import WelcomePage from './components/WelcomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MainPage from './components/MainPage';
import QuizList from './components/QuizList';
import QuizAttempt from './components/QuizAttempt';
import QuizCreate from './components/QuizCreate';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Scoreboard from './components/Scoreboard';
import './styles/global.css';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  return user && isAdmin() ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <QuizProvider>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/main"
              element={
                <PrivateRoute>
                  <MainPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/quizzes"
              element={
                <PrivateRoute>
                  <QuizList />
                </PrivateRoute>
              }
            />
            <Route
              path="/quiz/:id"
              element={
                <PrivateRoute>
                  <QuizAttempt />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-quiz"
              element={
                <PrivateRoute>
                  <QuizCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/scoreboard" element={<Scoreboard />} />
          </Routes>
        </QuizProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 