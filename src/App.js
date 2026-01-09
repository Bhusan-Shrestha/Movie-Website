import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MovieList from './components/MovieList';
import MovieDetail from './components/MovieDetail';
import CreateMovie from './components/CreateMovie';
import AdminDashboard from './components/AdminDashboard';
import ModeratorDashboard from './components/ModeratorDashboard';
import Profile from './components/Profile';
import './App.css';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" />;
}

function ModeratorRoute({ children }) {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return token && (user.role === 'MODERATOR' || user.role === 'ADMIN') ? (
    children
  ) : (
    <Navigate to="/" />
  );
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return token && user.role === 'ADMIN' ? (
    children
  ) : (
    <Navigate to="/" />
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const location = useLocation();

  const loadUserData = () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    console.log('Loading user data:', { token: !!token, userData }); // Debug log
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user:', parsedUser); // Debug log
        setIsLoggedIn(true);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    loadUserData();
    
    // Listen for storage changes (when login happens in same tab)
    window.addEventListener('storage', loadUserData);
    
    // Listen for custom event from Login component
    window.addEventListener('userLoggedIn', loadUserData);
    
    return () => {
      window.removeEventListener('storage', loadUserData);
      window.removeEventListener('userLoggedIn', loadUserData);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
      setMobileMenuOpen(false);
      navigate('/login');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return '👨‍💼';
      case 'MODERATOR':
        return '👨‍🔬';
      case 'VIEWER':
        return '👤';
      default:
        return '👤';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'role-badge-admin';
      case 'MODERATOR':
        return 'role-badge-moderator';
      case 'VIEWER':
        return 'role-badge-viewer';
      default:
        return '';
    }
  };

  return (
    <div className="App">
      <header className="navbar">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            Movies
          </Link>
          
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <nav className={`navbar-nav ${mobileMenuOpen ? 'active' : ''}`}>
            <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              {isLoggedIn ? '🎬 Browse Movies' : '🏠 Home'}
            </Link>
            {isLoggedIn && user?.role === 'MODERATOR' && (
              <Link to="/moderator" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                📊 My Dashboard
              </Link>
            )}
            {/* {isLoggedIn && (user?.role === 'MODERATOR' || user?.role === 'ADMIN') && (
              <Link to="/create" className="nav-link nav-link-upload" onClick={() => setMobileMenuOpen(false)}>
                📤 Upload Movie
              </Link>
            )} */}
            {isLoggedIn && user?.role === 'ADMIN' && (
              <Link to="/admin" className="nav-link nav-link-admin" onClick={() => setMobileMenuOpen(false)}>
                ⚙️ Admin Panel
              </Link>
            )}
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="nav-link">🔓 Login</Link>
                <Link to="/register" className="nav-link nav-link-register">✍️ Register</Link>
              </>
            ) : (
              <div className="nav-user-section">
                <Link to="/profile" className={`user-info-badge ${getRoleBadgeClass(user?.role)}`} onClick={() => setMobileMenuOpen(false)}>
                  <span className="role-icon">{getRoleIcon(user?.role)}</span>
                  <div className="user-details">
                    <span className="username">{user?.username}</span>
                  </div>
                </Link>
                <button className="logout-btn" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<MovieList userRole={user?.role} isAuthenticated={isLoggedIn} />} />
          <Route
            path="/movie/:slug"
            element={
              <PrivateRoute>
                <MovieDetail userRole={user?.role} />
              </PrivateRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ModeratorRoute>
                <CreateMovie />
              </ModeratorRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/moderator"
            element={
              <ModeratorRoute>
                <ModeratorDashboard />
              </ModeratorRoute>
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
        </Routes>
      </main>

      <footer className="footer">
        <p>&copy; 2024 Movies - Your Entertainment Hub 🎥</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
