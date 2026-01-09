import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('approvals');
  const [pendingMovies, setPendingMovies] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    pendingApprovals: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch pending movies
      const moviesRes = await fetch('http://localhost:8080/api/approvals/pending/movies', { headers });
      if (moviesRes.ok) {
        const response = await moviesRes.json();
        const movies = response.content || response;
        setPendingMovies(Array.isArray(movies) ? movies : []);
        setStats(prev => ({ ...prev, pendingApprovals: movies.length }));
      }

      // Fetch all users
      const usersRes = await fetch('http://localhost:8080/api/admin/users', { headers });
      if (usersRes.ok) {
        const users = await usersRes.json();
        // Map users to handle nested metadata structure
        const mappedUsers = users.map(user => ({
          id: user.id,
          username: user.metadata?.username || user.username || 'N/A',
          email: user.metadata?.email || user.email || 'N/A',
          role: user.metadata?.role || user.role || 'VIEWER',
          createdAt: user.auditInfo?.createdAt || user.createdAt || null,
        }));
        setAllUsers(mappedUsers);
        setStats(prev => ({ ...prev, totalUsers: mappedUsers.length }));
      }
    } catch (error) {
      setMessage('Failed to load dashboard data');
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveMovie = async (movieId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/movies/approve/${movieId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        setMessage('✓ Movie approved successfully!');
        setPendingMovies(pendingMovies.filter(m => m.id !== movieId));
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Failed to approve movie');
      console.error('Error approving movie:', error);
    }
  };

  const rejectMovie = async (movieId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/movies/${movieId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        setMessage('✓ Movie rejected successfully!');
        setPendingMovies(pendingMovies.filter(m => m.id !== movieId));
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Failed to reject movie');
      console.error('Error rejecting movie:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>⚙️ Admin Dashboard</h1>
        <p>Manage content, users, and platform settings</p>
      </div>

      {message && (
        <div className={`admin-message ${message.includes('✓') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎬</div>
          <div className="stat-content">
            <span className="stat-label">Total Movies</span>
            <span className="stat-value">{stats.totalMovies}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{stats.totalUsers}</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-label">Pending Approvals</span>
            <span className="stat-value">{stats.pendingApprovals}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <span className="stat-label">Total Reviews</span>
            <span className="stat-value">{stats.totalReviews}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          📋 Pending Approvals ({stats.pendingApprovals})
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users Management
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Platform Settings
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="approvals-section">
            <h2>📋 Movies Pending Approval</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : pendingMovies.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✓</span>
                <p>All movies have been approved!</p>
              </div>
            ) : (
              <div className="movies-list">
                {pendingMovies.map((movie) => {
                  const title = movie.metadata?.title || movie.title || 'Untitled';
                  const description = movie.metadata?.description || movie.description || '';
                  const createdAt = movie.auditInfo?.createdAt || movie.createdAt || movie.uploadedAt;
                  const uploader = movie.auditInfo?.uploadedBy || movie.uploadedBy?.username || movie.uploadedBy || 'N/A';
                  const runtime = movie.metadata?.runtimeMinutes || movie.runtimeMinutes || movie.duration || 'N/A';
                  return (
                    <div key={movie.id} className="movie-approval-card">
                      <div className="movie-info">
                        <h3>{title}</h3>
                        <p className="movie-description">{description}</p>
                        <div className="movie-meta">
                          <span>📅 {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</span>
                          <span>👤 Uploaded by: {typeof uploader === 'string' ? uploader : 'N/A'}</span>
                          <span>⏱️ {runtime !== 'N/A' ? `${runtime} mins` : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="approval-actions">
                        <button
                          className="btn-approve"
                          onClick={() => approveMovie(movie.id)}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => rejectMovie(movie.id)}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-section">
            <h2>👥 User Management</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id}>
                        <td><strong>{user.username || 'N/A'}</strong></td>
                        <td>{user.email || 'N/A'}</td>
                        <td>
                          <span className={`role-badge role-${(user.role || 'viewer').toLowerCase()}`}>
                            {user.role || 'VIEWER'}
                          </span>
                        </td>
                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td><span className="status-badge active">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2>⚙️ Platform Settings</h2>
            <div className="settings-grid">
              <div className="setting-card">
                <h3>🎥 Content Settings</h3>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Allow user uploads
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Require admin approval
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Enable reviews
                  </label>
                </div>
              </div>

              <div className="setting-card">
                <h3>🛡️ Security Settings</h3>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Two-factor authentication
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" /> Rate limiting
                  </label>
                </div>
              </div>

              <div className="setting-card">
                <h3>📧 Email Notifications</h3>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Send approval notifications
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Send review notifications
                  </label>
                </div>
              </div>
            </div>

            <button className="btn-save-settings">💾 Save Settings</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
