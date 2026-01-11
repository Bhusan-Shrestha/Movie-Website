import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ModeratorDashboard.css';

function ModeratorDashboard() {
  const [allMovies, setAllMovies] = useState([]);
  const [myMovies, setMyMovies] = useState([]);
  const [stats, setStats] = useState({
    totalUploads: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    loadModeratorData();
  }, []);

  const loadModeratorData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUsername = (storedUser?.metadata?.username || storedUser?.username || '').toLowerCase();
      const currentUserId = storedUser?.metadata?.id || storedUser?.id;

      if (!currentUsername && !currentUserId) {
        setMessage('Could not determine your user account. Please log in again.');
        setMyMovies([]);
        setStats({ totalUploads: 0, approved: 0, pending: 0, rejected: 0 });
        return;
      }

      // Fetch my movies (any status)
      const myRes = await fetch('http://localhost:8080/api/movies/my?page=0&size=500&sortBy=createdAt&direction=DESC', { headers });
      if (myRes.ok) {
        const myPage = await myRes.json();
        // Handle new response format: { status, message, data: { content: [...] } }
        const mine = myPage.data && myPage.data.content ? myPage.data.content : 
                     (Array.isArray(myPage) ? myPage : (myPage.content || []));
        setMyMovies(mine);

        const approved = mine.filter(m => (m.statusInfo?.status || m.status) === 'APPROVED').length;
        const pending = mine.filter(m => (m.statusInfo?.status || m.status) === 'PENDING').length;
        const rejected = mine.filter(m => (m.statusInfo?.status || m.status) === 'REJECTED').length;

        setStats({ totalUploads: mine.length, approved, pending, rejected });
      }

      // Fetch all approved movies for the "All Movies" tab
      const allRes = await fetch('http://localhost:8080/api/movies/all?page=0&size=500&sortBy=createdAt&direction=DESC', { headers });
      if (allRes.ok) {
        const allPage = await allRes.json();
        // Handle new response format: { status, message, data: { content: [...] } }
        const allList = allPage.data && allPage.data.content ? allPage.data.content :
                        (Array.isArray(allPage) ? allPage : (allPage.content || []));
        setAllMovies(allList);
      }
    } catch (error) {
      console.error('Error loading moderator data:', error);
      setMessage('Failed to load your content');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = (movieId) => {
    setMovieToDelete(movieId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMovie = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/movies/${movieToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage('Movie deleted successfully!');
        setShowDeleteConfirm(false);
        setMovieToDelete(null);
        loadModeratorData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(errorData.message || errorData.error || 'Failed to delete movie');
        setShowDeleteConfirm(false);
        setMovieToDelete(null);
      }
    } catch (error) {
      setMessage('Error deleting movie');
      console.error('Error:', error);
      setShowDeleteConfirm(false);
      setMovieToDelete(null);
    }
  };

  const handleResubmitMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to resubmit this movie for approval?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/movies/${movieId}/resubmit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage('Movie resubmitted successfully! It will be reviewed by admin.');
        loadModeratorData();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to resubmit movie');
      }
    } catch (error) {
      setMessage('Error resubmitting movie');
      console.error('Error:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED': return 'status-approved';
      case 'PENDING': return 'status-pending';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  };

  const resolveThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    const cleanedPath = thumbnailPath.replace(/\\/g, '/');
    if (/^https?:\/\//i.test(cleanedPath)) return cleanedPath;
    const normalized = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`;
    return `http://localhost:8080/api${normalized}`;
  };

  const formatRuntime = (minutes) => {
    if (!minutes || minutes <= 0) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} hour ${m} minute`;
  };

  if (loading) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  return (
    <div className="moderator-dashboard">
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="confirmation-card">
            <h3>⚠️ Delete Movie</h3>
            <p>Are you sure you want to delete this movie?</p>
            <div className="confirmation-actions">
              <button className="btn-confirm-danger" onClick={confirmDeleteMovie}>Yes, Delete</button>
              <button className="btn-cancel" onClick={() => {
                setShowDeleteConfirm(false);
                setMovieToDelete(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="dashboard-header">
        <h1>Moderator Dashboard</h1>
        <p>Manage your uploaded movies and track their status</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.totalUploads}</h3>
            <p>Total Uploads</p>
          </div>
        </div>
        <div className="stat-card stat-approved">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="stat-card stat-rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          🗂️ All Movies
        </button>
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📋 My Movies
        </button>
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pending ({stats.pending})
        </button>
        <button
          className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          ✅ Approved ({stats.approved})
        </button>
        <button
          className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          ❌ Rejected ({stats.rejected})
        </button>
        <button className="tab-btn btn-upload" onClick={() => navigate('/create')}>
          📤 Upload New Movie
        </button>
      </div>

      <div className="dashboard-content">
        {message && (
          <div className="message success-message">{message}</div>
        )}

        <div className="movies-section">
          {(activeTab !== 'all' && myMovies.length === 0) ? (
            <div className="empty-state">
              <p>You haven't uploaded any movies yet.</p>
              <button className="btn-upload-large" onClick={() => navigate('/create')}>
                Upload Your First Movie
              </button>
            </div>
          ) : (
            <div className="movies-grid">
              {(activeTab === 'all' ? allMovies : myMovies)
                .filter(movie => {
                  const status = movie.statusInfo?.status || movie.status;
                  if (activeTab === 'pending') return status === 'PENDING';
                  if (activeTab === 'approved') return status === 'APPROVED';
                  if (activeTab === 'rejected') return status === 'REJECTED';
                  return true;
                })
                .map((movie) => {
                  const title = movie.metadata?.title || movie.title || 'Untitled';
                  const description = movie.metadata?.description || movie.description || '';
                  const year = movie.metadata?.year ?? movie.releasedYear ?? movie.year ?? 'N/A';
                  const runtime = movie.metadata?.runtimeMinutes ?? movie.runtimeMinutes ?? movie.duration;
                  const thumbnailPath = movie.media?.thumbnailPath || movie.thumbnail || movie.metadata?.thumbnailPath || movie.metadata?.thumbnail;
                  const thumbnailUrl = resolveThumbnailUrl(thumbnailPath);

                  const handleCardClick = () => {
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    navigate(`/movie/${slug}`);
                  };
                  const currentStatus = movie.statusInfo?.status || movie.status;
                  return (
                    <div key={movie.id} className="movie-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
                      <div className="movie-thumbnail">
                        {thumbnailUrl ? (
                          <img src={thumbnailUrl} alt={title} />
                        ) : (
                          <div className="no-thumbnail">🎬</div>
                        )}
                        <span className={`status-badge ${getStatusBadgeClass(currentStatus)}`}>
                          {currentStatus}
                        </span>
                      </div>
                      <div className="movie-info">
                        <h3>{title}</h3>
                        <p className="movie-description">
                          {description ? `${description.substring(0, 100)}...` : 'No description provided.'}
                        </p>
                        <div className="movie-meta">
                          <span>📅 {year}</span>
                          <span>⏱️ {runtime ? `${formatRuntime(runtime)}` : 'N/A'}</span>
                        </div>
                        <div className="movie-actions">
                          {currentStatus === 'REJECTED' ? (
                            <div className="rejected-actions-layout">
                              <button
                                className="btn-edit btn-full-width"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/edit-movie/${movie.id}`);
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <div className="rejected-bottom-actions">
                                <button
                                  className="btn-resubmit"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleResubmitMovie(movie.id);
                                  }}
                                >
                                  🔄 Resubmit
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMovie(movie.id);
                                  }}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                className="btn-edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/edit-movie/${movie.id}`);
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMovie(movie.id);
                                }}
                              >
                                🗑️ Delete
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
      </div>

      <div className="help-section">
        <h3>💡 Tips for Content Creators</h3>
        <ul>
          <li>✅ Uploaded movies with PENDING status are awaiting admin approval</li>
          <li>❌ If your movie is REJECTED, you can edit it and resubmit for approval</li>
          <li>📝 Make sure to include detailed descriptions and accurate information</li>
          <li>🎯 High-quality thumbnails improve viewer engagement</li>
          <li>⏱️ Approval typically takes 24-48 hours</li>
          <li>🔄 Use the RESUBMIT button to apply rejected movies again after editing</li>
        </ul>
      </div>
    </div>
  );
}

export default ModeratorDashboard;
