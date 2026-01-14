import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('approvals');
  const [pendingMovies, setPendingMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    pendingApprovals: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    role: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [movieTitle, setMovieTitle] = useState('');

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
        console.log('Pending movies response:', response);
        const movies = response.content || response;
        const list = Array.isArray(movies) ? movies : [];
        console.log('Pending movies list:', list);
        setPendingMovies(list);
        pendingCount = list.length;
        setStats(prev => ({ ...prev, pendingApprovals: pendingCount }));
      } else {
        console.error('Failed to fetch pending movies:', moviesRes.status);
      }

      // Fetch all users
      const usersRes = await fetch('http://localhost:8080/api/admin/users', { headers });
      if (usersRes.ok) {
        const users = await usersRes.json();
        // Map users to handle nested metadata structure
        const mappedUsers = users.map(user => ({
          id: user.id,
          name: user.metadata?.name || user.name || '',
          username: user.metadata?.username || user.username || 'N/A',
          email: user.metadata?.email || user.email || 'N/A',
          phone: user.metadata?.phone || user.phone || '',
          address: user.metadata?.address || user.address || '',
          role: user.metadata?.role || user.role || 'VIEWER',
          createdAt: user.auditInfo?.createdAt || user.createdAt || null,
        }));
        setAllUsers(mappedUsers);
        setStats(prev => ({ ...prev, totalUsers: mappedUsers.length }));
      }

      // Fetch all movies (approved, pending, rejected) from all users
      const allMoviesRes = await fetch('http://localhost:8080/api/admin/movies/all?page=0&size=500', { headers });
      if (allMoviesRes.ok) {
        const allMoviesPage = await allMoviesRes.json();
        // Handle new response format: { status, message, data: { content: [...] } }
        const allMoviesList = allMoviesPage.data && allMoviesPage.data.content ? allMoviesPage.data.content :
                              (Array.isArray(allMoviesPage) ? allMoviesPage : (allMoviesPage.content || []));
        setAllMovies(allMoviesList);
        
        // Count by status
        const approvedCount = allMoviesList.filter(m => (m.statusInfo?.status || m.status) === 'APPROVED').length;
        const rejectedCount = allMoviesList.filter(m => (m.statusInfo?.status || m.status) === 'REJECTED').length;
        
        setStats(prev => ({ 
          ...prev, 
          approved: approvedCount,
          rejected: rejectedCount,
          totalMovies: allMoviesList.length
        }));
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
      const res = await fetch(`http://localhost:8080/api/approvals/movies/${movieId}/reject`, {
        method: 'POST',
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

  const handleDeleteMovie = (movieId, title) => {
    setMovieToDelete(movieId);
    setMovieTitle(title);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMovie = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/movies/${movieToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        setMessage('✓ Movie deleted successfully!');
        setShowDeleteConfirm(false);
        setMovieToDelete(null);
        setMovieTitle('');
        loadDashboardData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete movie');
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      setMessage('Failed to delete movie');
      console.error('Error deleting movie:', error);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDeleteMovie = () => {
    setShowDeleteConfirm(false);
    setMovieToDelete(null);
    setMovieTitle('');
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || ''
    });
  };

  const closeEditUserModal = () => {
    setEditingUser(null);
    setEditFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      address: '',
      role: ''
    });
  };

  const saveUserChanges = async (userId) => {
    try {
      await adminAPI.updateUser(userId, editFormData);
      setMessage('✓ User updated successfully!');
      loadDashboardData();
      closeEditUserModal();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update user');
      console.error('Error updating user:', error);
    }
  };

  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
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
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-label">Approved</span>
            <span className="stat-value">{stats.approved}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-label">Pending Approvals</span>
            <span className="stat-value">{stats.pendingApprovals}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <span className="stat-label">Rejected</span>
            <span className="stat-value">{stats.rejected}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          🗂️ All Movies
        </button>
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
          👥 Users Management ({stats.totalUsers})
        </button>
        <button className="tab-btn btn-upload" onClick={() => navigate('/create')}>
          📤 Upload New Movie
        </button>

      </div>

      {/* Content */}
      <div className="admin-content">
        {/* All Movies Tab */}
        {activeTab === 'all' && (
          <div className="all-movies-section">
            <h2>🗂️ All Movies</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : allMovies.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎬</span>
                <p>No movies in the system yet.</p>
              </div>
            ) : (
              <div className="movies-grid-admin">
                {allMovies.map((movie) => {
                  const title = movie.metadata?.title || movie.title || 'Untitled';
                  const description = movie.metadata?.description || movie.description || '';
                  const status = movie.statusInfo?.status || movie.status;
                  const thumbnailPath = movie.media?.thumbnailPath || movie.thumbnail || movie.metadata?.thumbnailPath || movie.metadata?.thumbnail;
                  const thumbnailUrl = resolveThumbnailUrl(thumbnailPath);
                  const videoPath = movie.media?.videoPath || movie.videoPath || movie.video || movie.media?.video;
                  const videoUrl = resolveVideoUrl(videoPath);
                  const runtime = movie.metadata?.runtimeMinutes || movie.runtimeMinutes || movie.duration || 'N/A';
                  const movieSlug = createSlug(title);
                  
                  return (
                    <div key={movie.id} className="movie-card-compact">
                      <div 
                        className="movie-thumbnail-compact"
                        onClick={() => navigate(`/movie/${movieSlug}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {thumbnailUrl ? (
                          <img src={thumbnailUrl} alt={title} />
                        ) : (
                          <div className="no-thumbnail-compact">🎬</div>
                        )}
                        <span className={`status-badge-overlay status-${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </div>
                      <div className="movie-details-compact">
                        <h3 
                          className="movie-title-compact"
                          onClick={() => navigate(`/movie/${movieSlug}`)}
                          style={{ cursor: 'pointer' }}
                        >{title}</h3>
                        <p className="movie-description-compact">
                          {description ? `${description.substring(0, 80)}...` : 'No description'}
                        </p>
                        <div className="movie-meta-compact">
                          <span>⏱️ {runtime !== 'N/A' ? `${formatRuntime(runtime)}` : 'N/A'}</span>
                        </div>
                        <div className="approval-actions-compact">
                          <button
                            className="btn-edit-compact"
                            onClick={(e) => { 
                              e.stopPropagation();
                              window.location.href = `/create?edit=${movie.id}`; 
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-delete-compact"
                            onClick={(e) => { 
                              e.stopPropagation();
                              handleDeleteMovie(movie.id, title);
                            }}
                          >
                            🗑️ Delete
                          </button>
                          {status === 'PENDING' && (
                            <>
                              <button
                                className="btn-approve-compact"
                                onClick={(e) => { 
                                  e.stopPropagation();
                                  approveMovie(movie.id);
                                }}
                              >
                                ✓ Approve
                              </button>
                              <button
                                className="btn-reject-compact"
                                onClick={(e) => { 
                                  e.stopPropagation();
                                  rejectMovie(movie.id);
                                }}
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
              <div className="movies-grid-admin">
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
                    <div key={movie.id} className="movie-card-compact">
                      <div className="movie-thumbnail-compact">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={title}
                            onClick={() => { if (videoUrl) window.open(videoUrl, '_blank'); }}
                            style={{ cursor: videoUrl ? 'pointer' : 'default' }}
                          />
                        ) : (
                          <div className="no-thumbnail-compact">🎬</div>
                        )}
                      </div>
                      <div className="movie-details-compact">
                        <h3 className="movie-title-compact">{title}</h3>
                        <p className="movie-description-compact">
                          {description ? `${description.substring(0, 80)}...` : 'No description'}
                        </p>
                        <div className="movie-meta-compact">
                          <span>📅 {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</span>
                          <span>⏱️ {runtime !== 'N/A' ? `${formatRuntime(runtime)}` : 'N/A'}</span>
                        </div>
                        <div className="uploader-info">
                          <span>👤 Uploaded by: {typeof uploader === 'string' ? uploader : 'N/A'}</span>
                        </div>
                        <div className="approval-actions-compact">
                          {videoUrl && (
                            <button
                              className="btn-play-compact"
                              onClick={() => window.open(videoUrl, '_blank')}
                            >
                              ▶ Play
                            </button>
                          )}
                          <button
                            className="btn-edit-compact"
                            onClick={() => { window.location.href = `/create?edit=${movie.id}`; }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-approve-compact"
                            onClick={() => approveMovie(movie.id)}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="btn-reject-compact"
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id}>
                        <td><strong>{user.username || 'N/A'}</strong></td>
                        <td>{user.email || 'N/A'}</td>
                        <td>
                          <span className={`role-badge role-text ${user.role || 'VIEWER'}`}>
                            {user.role || 'VIEWER'}
                          </span>
                        </td>
                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <button
                            className="btn-edit-user"
                            onClick={() => openEditUserModal(user)}
                          >
                            ✏️ Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit User: {editingUser.username}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveUserChanges(editingUser.id);
                }}
              >
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  >
                    <option value="VIEWER">VIEWER</option>
                    <option value="MODERATOR">MODERATOR</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-save">
                    💾 Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={closeEditUserModal}
                  >
                    ✕ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content confirmation-card">
              <h3>Delete Movie</h3>
              <p>Are you sure you want to delete <strong>"{movieTitle}"</strong>?</p>
              <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '10px' }}>
                ⚠️ This action cannot be undone.
              </p>
              <div className="confirmation-actions">
                <button 
                  className="btn-confirm-danger" 
                  onClick={confirmDeleteMovie}
                >
                  🗑️ Yes, Delete
                </button>
                <button 
                  className="btn-confirm" 
                  onClick={cancelDeleteMovie}
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
