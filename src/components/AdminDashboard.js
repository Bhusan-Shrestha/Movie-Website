import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
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
    let pendingCount = 0;
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch pending movies
      const moviesRes = await fetch('http://localhost:8080/api/approvals/pending/movies', { headers });
      if (moviesRes.ok) {
        const response = await moviesRes.json();
        const movies = response.content || response;
        const list = Array.isArray(movies) ? movies : [];
        setPendingMovies(list);
        pendingCount = list.length;
        setStats(prev => ({ ...prev, pendingApprovals: pendingCount }));
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

      // Fetch approved movies count to compute Total Movies (approved + pending)
      const approvedRes = await fetch('http://localhost:8080/api/movies/all?page=0&size=1', { headers });
      if (approvedRes.ok) {
        const approvedPage = await approvedRes.json();
        const approvedTotal = typeof approvedPage.totalElements === 'number'
          ? approvedPage.totalElements
          : (Array.isArray(approvedPage) ? approvedPage.length : (approvedPage.content?.length || 0));
        setStats(prev => ({ ...prev, totalMovies: approvedTotal + pendingCount }));
      } else {
        setStats(prev => ({ ...prev, totalMovies: pendingCount }));
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

  const resolveThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    const cleanedPath = thumbnailPath.replace(/\\/g, '/');
    if (/^https?:\/\//i.test(cleanedPath)) return cleanedPath;
    const normalized = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`;
    return `http://localhost:8080/api${normalized}`;
  };

  const resolveVideoUrl = (videoPath) => {
    if (!videoPath) return null;
    if (/^https?:\/\//i.test(videoPath)) return videoPath;
    const normalized = videoPath.startsWith('/') ? videoPath : `/${videoPath}`;
    return `http://localhost:8080${normalized}`;
  };

  const formatRuntime = (minutes) => {
    if (!minutes || minutes <= 0) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} hour ${m} minute`;
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>⚙️ Admin Dashboard</h1>
        <p>Manage content and users</p>
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
        <button className="tab-btn btn-upload" onClick={() => navigate('/create')}>
          📤 Upload New Movie
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
                  const thumbnailPath = movie.media?.thumbnailPath || movie.thumbnail || movie.metadata?.thumbnailPath || movie.metadata?.thumbnail;
                  const videoPath = movie.media?.videoPath || movie.videoPath || movie.video || movie.media?.video;
                  const thumbnailUrl = resolveThumbnailUrl(thumbnailPath);
                  const videoUrl = resolveVideoUrl(videoPath);
                  return (
                    <div key={movie.id} className="movie-approval-card">
                      <div className="movie-media">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={title}
                            onClick={() => { if (videoUrl) window.open(videoUrl, '_blank'); }}
                            style={{ cursor: videoUrl ? 'pointer' : 'default' }}
                          />
                        ) : (
                          <div className="no-thumbnail">🎬</div>
                        )}
                      </div>
                      <div className="movie-info">
                        <h3>{title}</h3>
                        <p className="movie-description">{description}</p>
                        <div className="movie-meta">
                          <span>📅 {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</span>
                          <span>👤 Uploaded by: {typeof uploader === 'string' ? uploader : 'N/A'}</span>
                          <span>⏱️ {runtime !== 'N/A' ? `${formatRuntime(runtime)}` : 'N/A'}</span>
                        </div>
                        <div className="approval-actions">
                          {videoUrl && (
                            <button
                              className="btn-play"
                              onClick={() => window.open(videoUrl, '_blank')}
                            >
                              ▶ Play
                            </button>
                          )}
                          <button
                            className="btn-edit"
                            onClick={() => { window.location.href = `/create?edit=${movie.id}`; }}
                          >
                            ✏️ Edit
                          </button>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  );
}

export default AdminDashboard;
