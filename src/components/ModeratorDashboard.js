import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ModeratorDashboard.css';

function ModeratorDashboard() {
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
  const navigate = useNavigate();

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    loadModeratorData();
  }, []);

  const loadModeratorData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch all movies (backend doesn't have my-movies endpoint)
      const moviesRes = await fetch('http://localhost:8080/api/movies/all', { headers });
      if (moviesRes.ok) {
        const response = await moviesRes.json();
        const moviesList = Array.isArray(response) ? response : (response.content || []);
        setMyMovies(moviesList);
        
        // Calculate stats (Note: showing all approved movies since backend doesn't filter by moderator)
        const approved = moviesList.filter(m => m.status === 'APPROVED').length;
        const pending = moviesList.filter(m => m.status === 'PENDING').length;
        const rejected = moviesList.filter(m => m.status === 'REJECTED').length;
        
        setStats({
          totalUploads: moviesList.length,
          approved,
          pending,
          rejected
        });
      }
    } catch (error) {
      console.error('Error loading moderator data:', error);
      setMessage('Failed to load your content');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/movies/${movieId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage('Movie deleted successfully!');
        loadModeratorData();
      } else {
        setMessage('Failed to delete movie');
      }
    } catch (error) {
      setMessage('Error deleting movie');
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

  if (loading) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  return (
    <div className="moderator-dashboard">
      <div className="dashboard-header">
        <h1>🎬 Content Creator Dashboard</h1>
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
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📋 All Movies
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
        <button className="tab-btn btn-upload" onClick={() => navigate('/create')}>
          📤 Upload New Movie
        </button>
      </div>

      <div className="dashboard-content">
        {message && (
          <div className="message success-message">{message}</div>
        )}

        <div className="movies-section">
          {myMovies.length === 0 ? (
            <div className="empty-state">
              <p>🎬 You haven't uploaded any movies yet.</p>
              <button className="btn-upload-large" onClick={() => navigate('/create')}>
                Upload Your First Movie
              </button>
            </div>
          ) : (
            <div className="movies-grid">
              {myMovies
                .filter(movie => {
                  if (activeTab === 'pending') return movie.status === 'PENDING';
                  if (activeTab === 'approved') return movie.status === 'APPROVED';
                  return true;
                })
                .map((movie) => (
                  <div key={movie.id} className="movie-card">
                    <div className="movie-thumbnail">
                      {movie.thumbnail ? (
                        <img src={`http://localhost:8080${movie.thumbnail}`} alt={movie.title} />
                      ) : (
                        <div className="no-thumbnail">🎬</div>
                      )}
                      <span className={`status-badge ${getStatusBadgeClass(movie.status)}`}>
                        {movie.status}
                      </span>
                    </div>
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <p className="movie-description">
                        {movie.description?.substring(0, 100)}...
                      </p>
                      <div className="movie-meta">
                        <span>📅 {movie.releasedYear || 'N/A'}</span>
                        <span>⭐ {movie.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <div className="movie-actions">
                        <button
                          className="btn-view"
                          onClick={() => {
                            const title = movie.metadata?.title || movie.title || 'untitled';
                            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                            navigate(`/movie/${slug}`);
                          }}
                        >
                          👁️ View
                        </button>
                        {movie.status === 'PENDING' && (
                          <button
                            className="btn-edit"
                            onClick={() => navigate(`/edit-movie/${movie.id}`)}
                          >
                            ✏️ Edit
                          </button>
                        )}
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteMovie(movie.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="help-section">
        <h3>💡 Tips for Content Creators</h3>
        <ul>
          <li>✅ Uploaded movies with PENDING status are awaiting admin approval</li>
          <li>📝 Make sure to include detailed descriptions and accurate information</li>
          <li>🎯 High-quality thumbnails improve viewer engagement</li>
          <li>⏱️ Approval typically takes 24-48 hours</li>
        </ul>
      </div>
    </div>
  );
}

export default ModeratorDashboard;
