import React, { useState, useEffect } from 'react';
import { movieAPI } from '../services/api';
import './MovieList.css';

function MovieList({ userRole, isAuthenticated }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [direction, setDirection] = useState('DESC');
  // eslint-disable-next-line no-unused-vars
  const [filterGenre, setFilterGenre] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [topRated, setTopRated] = useState([]);

  useEffect(() => {
    fetchMovies();
    if (activeTab === 'trending') {
      fetchTopRated();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, direction, activeTab]);

  const fetchMovies = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (searchTerm.trim()) {
        response = await movieAPI.searchMovies(searchTerm, page, 10);
      } else {
        response = await movieAPI.getAllMovies(page, 10, sortBy, direction);
      }
      setMovies(response.data.content || response.data);
    } catch (err) {
      setError('Failed to fetch movies');
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopRated = async () => {
    try {
      const response = await movieAPI.getTopRatedMovies();
      const data = response.data;
      // Handle paginated response
      setTopRated(Array.isArray(data) ? data : (data.content || []));
    } catch (err) {
      console.error('Error fetching top rated:', err);
      setTopRated([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchMovies();
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(0);
  };

  const handleDirectionChange = (e) => {
    setDirection(e.target.value);
    setPage(0);
  };

  // Rating stars component removed; rating now shown inline as numeric value next to runtime

  const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const MovieCard = ({ movie }) => {
    const thumbnailUrl = movie.media?.thumbnailPath 
      ? `http://localhost:8080/api${movie.media.thumbnailPath}`
      : movie.thumbnail
      ? `http://localhost:8080/api${movie.thumbnail}`
      : null;
    
    const movieTitle = movie.metadata?.title || movie.title || 'untitled';
    const movieSlug = createSlug(movieTitle);
    
    const formatRuntime = (minutes) => {
      if (!minutes || minutes <= 0) return null;
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h} hour ${m} minute`;
    };

    return (
      <a href={`/movie/${movieSlug}`} className="movie-card-link">
        <div className="movie-card">
          <div className="movie-card-image">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt={movieTitle} />
            ) : (
              <div className="placeholder-image">🎬</div>
            )}
          </div>
          <div className="movie-card-info">
            <h3>{movie.metadata?.title || movie.title}</h3>
            <p className="year">
              📅 {movie.metadata?.year || new Date(movie.createdAt).getFullYear()}
              {movie.metadata?.runtimeMinutes ? (
                <span className="runtime"> • ⏱️ {formatRuntime(movie.metadata.runtimeMinutes)}</span>
              ) : null}
            </p>
            <p className="description">
              {(movie.metadata?.description || movie.description)?.substring(0, 150)}...
            </p>
          </div>
        </div>
      </a>
    );
  };

  if (loading && movies.length === 0 && activeTab === 'all') {
    return (
      <div className="movie-list-container">
        <div className="loading-skeleton">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-list-container">

      <div className="controls-bar">
        <div className="list-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveTab('all'); setPage(0); }}
          >
            📚 All Movies
          </button>
          <button
            className={`tab-btn ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => { setActiveTab('trending'); setPage(0); }}
          >
            🔥 Trending
          </button>
        </div>

        <div className="filters-search">
          <div className="filters-section">
            <div className="filter-group">
              <label htmlFor="sort">Sort by:</label>
              <select id="sort" value={sortBy} onChange={handleSortChange}>
                <option value="createdAt">📅 Latest</option>
                <option value="title">🔤 Title</option>
                <option value="year">📽️ Year</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="direction">Order:</label>
              <select id="direction" value={direction} onChange={handleDirectionChange}>
                <option value="DESC">↓ Newest First</option>
                <option value="ASC">↑ Oldest First</option>
              </select>
            </div>
          </div>

          <div className="search-section">
            <form className="search-bar" onSubmit={handleSearch}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search movies by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="search-btn">Search</button>
            </form>
          </div>
        </div>
      </div>
        

      {activeTab === 'all' && (
        <>
          {error && <div className="error-message">⚠️ {error}</div>}

          {/* Movies Grid */}
          {movies.length === 0 && !loading ? (
            <div className="empty-state">
              <span className="empty-icon">🎬</span>
              <p>No movies found. Try a different search!</p>
            </div>
          ) : (
            <>
              <div className="movies-grid">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button
                  className="btn-pagination"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  ← Previous
                </button>
                <span className="page-info">Page <strong>{page + 1}</strong></span>
                <button
                  className="btn-pagination"
                  onClick={() => setPage(page + 1)}
                  disabled={movies.length < 10}
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Trending Tab */}
      {activeTab === 'trending' && (
        <>
          <h2>🔥 Trending Movies</h2>
          {loading ? (
            <div className="loading">Loading trending movies...</div>
          ) : topRated.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">⚡</span>
              <p>No trending movies yet!</p>
            </div>
          ) : (
            <div className="movies-grid">
              {topRated.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MovieList;
