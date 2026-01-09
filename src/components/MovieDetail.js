import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieAPI, reviewAPI } from '../services/api';
import './MovieDetail.css';

function MovieDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const token = localStorage.getItem('authToken');

  // Convert slug back to search term
  const titleFromSlug = slug.replace(/-/g, ' ');

  useEffect(() => {
    fetchMovieAndReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchMovieAndReviews = async () => {
    setLoading(true);
    setError('');
    try {
      // Search for movie by title
      const searchRes = await movieAPI.searchMovies(titleFromSlug, 0, 10);
      const movies = searchRes.data.content || searchRes.data;
      
      // Find exact match (case-insensitive)
      const foundMovie = movies.find(m => 
        (m.metadata?.title || m.title || '').toLowerCase() === titleFromSlug.toLowerCase()
      );
      
      if (!foundMovie) {
        setError('Movie not found');
        setLoading(false);
        return;
      }
      
      setMovie(foundMovie);

      const reviewsRes = await reviewAPI.getReviewsByMovie(foundMovie.id);
      setReviews(reviewsRes.data);
    } catch (err) {
      setError('Failed to fetch movie details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in to add a review');
      navigate('/login');
      return;
    }

    if (!movie?.id) {
      alert('Movie not loaded');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewAPI.addReview(movie.id, reviewText, parseInt(rating));
      setReviewText('');
      setRating(5);
      fetchMovieAndReviews();
      alert('Review added successfully!');
    } catch (err) {
      alert('Failed to add review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!movie) {
    return <div className="error-message">Movie not found</div>;
  }

  return (
    <div className="movie-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="movie-header">
        {/* Thumbnail with Play Button */}
        <div className="movie-poster">
          {movie.media?.thumbnailPath && !isPlaying ? (
            <div className="poster-container">
              <img 
                src={`http://localhost:8080/api${movie.media.thumbnailPath}`} 
                alt={movie.metadata?.title} 
                className="poster-image"
              />
              {movie.media?.videoPath && (
                <button 
                  className="play-button" 
                  onClick={() => setIsPlaying(true)}
                  title="Play video"
                >
                  ▶
                </button>
              )}
              {movie.rating?.averageRating && (
                <div className="rating-badge">⭐ {movie.rating.averageRating.toFixed(1)}</div>
              )}
            </div>
          ) : isPlaying && movie.media?.videoPath ? (
            <div className="video-container">
              <video width="100%" controls autoPlay className="movie-video">
                <source src={`http://localhost:8080/api${movie.media.videoPath}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="poster-placeholder">🎬</div>
          )}
        </div>

        {/* Movie Information */}
        <div className="movie-info">
          <h1><span>{movie.metadata?.title}</span></h1>
          <p className="info-row">Year: <span>{movie.metadata?.year}</span></p>
          <p className="info-row">Released: <span>{movie.metadata?.date}</span></p>
          
          {movie.metadata?.language && (
            <p className="info-row">Language: <span>{movie.metadata.language}</span></p>
          )}
          {movie.metadata?.runtimeMinutes && (
            <p className="info-row">Runtime: <span>{Math.floor(movie.metadata.runtimeMinutes / 60)} hour {movie.metadata.runtimeMinutes % 60} minute</span></p>
          )}
          
          {movie.metadata?.casts && (
            <p className="info-row">Cast: <span>{movie.metadata.casts}</span></p>
          )}
          
          {movie.metadata?.genres && movie.metadata.genres.length > 0 && (
            <p className="info-row">Genre: <span>{movie.metadata.genres.map((g) => g.name).join(' • ')}</span></p>
          )}
          
          {movie.metadata?.description && (
            <div className="description-section">
              <h3>Description</h3>
              <p>{movie.metadata.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="reviews-section">
        <div className="reviews-grid">
          <div className="reviews-column">
            <h2>Reviews ({reviews.length})</h2>
            {reviews.map((review) => (
              <div key={review.reviewId} className="review-item">
                <div className="review-header">
                  <strong>{review.reviewedBy?.username || review.reviewedBy?.name || 'Anonymous'}</strong>
                  <span className="rating">⭐ {review.rating}</span>
                </div>
                <p>{review.reviewText}</p>
              </div>
            ))}
            {reviews.length === 0 && <p>No reviews yet. Be the first to review!</p>}
          </div>

          <div className="add-review-column">
            <h2>Add Your Review</h2>
            {token ? (
              <form onSubmit={handleAddReview} className="review-form">
                <div className="form-group">
                  <label htmlFor="reviewText">Review</label>
                  <textarea
                    id="reviewText"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your review..."
                    rows="4"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rating">Rating</label>
                  <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>
                <button type="submit" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="login-prompt">Please log in to add a review.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
