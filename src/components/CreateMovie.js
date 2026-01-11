import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { movieAPI } from '../services/api';
import './CreateMovie.css';

function CreateMovie() {
  const navigate = useNavigate();
  const { id: movieId } = useParams();
  const [searchParams] = useSearchParams();
  const editId = movieId || searchParams.get('edit');
  const isEditMode = !!editId;

  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [newGenreName, setNewGenreName] = useState('');
  const [showAddGenre, setShowAddGenre] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'English',
    runtimeMinutes: 120,
    casts: '',
    year: new Date().getFullYear(),
    date: '',
    thumbnail: null,
    video: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  useEffect(() => {
    fetchGenres();
    if (isEditMode) {
      loadMovieForEdit();
    }
  }, []);

  const loadMovieForEdit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/movies/${editId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        let movieData = await response.json();
        // Handle new response format: { status, message, data: {...} }
        if (movieData.data) {
          movieData = movieData.data;
        }
        // Handle nested DTO structure
        const meta = movieData.metadata || movieData;
        const media = movieData.media || {};
        
        setFormData({
          title: meta.title || '',
          description: meta.description || '',
          language: meta.language || 'English',
          runtimeMinutes: meta.runtimeMinutes || 120,
          casts: meta.casts || '',
          year: meta.year || new Date().getFullYear(),
          date: meta.date || '',
          thumbnail: null,
          video: null,
        });

        // Load selected genres if available
        if (movieData.genres && Array.isArray(movieData.genres)) {
          setSelectedGenres(movieData.genres.map(g => g.id));
        }
      } else {
        setError('Failed to load movie for editing');
      }
    } catch (err) {
      console.error('Error loading movie:', err);
      setError('Failed to load movie for editing');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/genres', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        let data = await response.json();
        // Handle new response format: { status, message, data: [...] }
        if (data.data) {
          data = data.data;
        }
        setGenres(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const handleGenreSelect = (e) => {
    const genreId = parseInt(e.target.value);
    if (genreId && !selectedGenres.includes(genreId)) {
      setSelectedGenres(prev => [...prev, genreId]);
    }
    e.target.value = ''; // Reset select
  };

  const handleRemoveGenre = (genreId) => {
    setSelectedGenres(prev => prev.filter(id => id !== genreId));
  };

  const handleAddNewGenre = async () => {
    if (!newGenreName.trim()) {
      setError('Genre name is required');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('name', newGenreName.trim());
      formData.append('description', newGenreName.trim());

      const response = await fetch('http://localhost:8080/api/genres', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        let newGenre = await response.json();
        if (newGenre.data) {
          newGenre = newGenre.data;
        }
        setGenres(prev => [...prev, newGenre]);
        setSelectedGenres(prev => [...prev, newGenre.id]);
        setNewGenreName('');
        setShowAddGenre(false);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add genre');
      }
    } catch (error) {
      console.error('Error adding genre:', error);
      setError('Failed to add genre');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.title) {
      setError('Title is required');
      return;
    }

    // For create mode, require both thumbnail and video
    if (!isEditMode && (!formData.thumbnail || !formData.video)) {
      setError('Title, thumbnail, and video are required');
      return;
    }

    setLoading(true);
    try {
      let dataToSubmit;
      
      if (isEditMode) {
        // In edit mode, only include fields that have values
        // Unchanged fields (empty/null) won't be sent, so backend keeps old values
        // Thumbnail and video are optional - only sent if user selects new files
        dataToSubmit = {};
        if (formData.title) dataToSubmit.title = formData.title;
        if (formData.description) dataToSubmit.description = formData.description;
        if (formData.language) dataToSubmit.language = formData.language;
        if (formData.runtimeMinutes) dataToSubmit.runtimeMinutes = formData.runtimeMinutes;
        if (formData.casts) dataToSubmit.casts = formData.casts;
        if (formData.year) dataToSubmit.year = formData.year;
        if (formData.date) dataToSubmit.date = formData.date;
        // Thumbnail and video files are only included if user selected new ones
        if (formData.thumbnail) dataToSubmit.thumbnail = formData.thumbnail;
        if (formData.video) dataToSubmit.video = formData.video;
        // Genres only included if any are selected
        if (selectedGenres.length > 0) dataToSubmit.genreIds = selectedGenres.join(',');
      } else {
        // In create mode, include all fields
        dataToSubmit = {
          ...formData,
          genreIds: selectedGenres.join(',')
        };
      }

      if (isEditMode) {
        await movieAPI.updateMovie(editId, dataToSubmit);
        setSuccessMessage('Movie updated successfully!');
      } else {
        await movieAPI.createMovie(dataToSubmit);
        setSuccessMessage('Movie created successfully! It will be pending approval.');
      }
      setError('');
      setShowSuccessCard(true);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate(-1);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || (isEditMode ? 'Failed to update movie' : 'Failed to create movie'));
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="create-movie-container"><p>Loading movie data...</p></div>;
  }

  return (
    <div className="create-movie-container">
      {showSuccessCard && (
        <div className="modal-overlay">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2>{isEditMode ? 'Movie Updated!' : 'Movie Created!'}</h2>
            <p>{successMessage}</p>
            <p className="redirect-text">Redirecting you back...</p>
            <button className="btn-success" onClick={() => navigate(-1)}>Go Back Now</button>
          </div>
        </div>
      )}
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <h1>{isEditMode ? 'Edit Movie' : 'Create New Movie'}</h1>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="movie-form">
        <div className="form-group">
          <label htmlFor="title">Title {!isEditMode && '*'}</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required={!isEditMode}
          />
        </div>

        <div className="form-group">
          <label htmlFor="runtimeMinutes">Runtime (minutes) {!isEditMode && '*'}</label>
          <input
            id="runtimeMinutes"
            type="number"
            name="runtimeMinutes"
            value={formData.runtimeMinutes}
            onChange={handleChange}
            min="1"
            placeholder="e.g., 149"
          />
          <small>
            Will display as {Math.floor((formData.runtimeMinutes || 0) / 60)} hour{' '}
            {(formData.runtimeMinutes || 0) % 60} minute
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Storyline {!isEditMode && '*'}</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="language">Language {!isEditMode && '*'}</label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
          >
            <option value="English">English</option>
            <option value="Nepali">Nepali</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Chinese">Chinese</option> 
            <option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option>
            <option value="Italian">Italian</option>
            <option value="Portuguese">Portuguese</option>
            <option value="Russian">Russian</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="casts">Casts {!isEditMode && '*'}</label>
          <input
            id="casts"
            type="text"
            name="casts"
            value={formData.casts}
            onChange={handleChange}
            placeholder="Actor1, Actor2, Actor3"
          />
        </div>

        <div className="form-group">
          <label>Genres {!isEditMode && '*'}</label>
          <div className="genre-select-wrapper">
            <select 
              className="genre-select" 
              onChange={handleGenreSelect}
              defaultValue=""
            >
              <option value="" disabled>Select a genre...</option>
              {genres.map((genre) => (
                <option 
                  key={genre.id} 
                  value={genre.id}
                  disabled={selectedGenres.includes(genre.id)}
                >
                  {genre.name}
                </option>
              ))}
            </select>
            <button 
              type="button" 
              className="btn-add-genre" 
              onClick={() => setShowAddGenre(!showAddGenre)}
            >
              + Add New Genre
            </button>
          </div>

          {showAddGenre && (
            <div className="add-genre-form">
              <input
                type="text"
                placeholder="Enter new genre name"
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewGenre())}
              />
              <button type="button" onClick={handleAddNewGenre}>Add</button>
              <button type="button" onClick={() => {setShowAddGenre(false); setNewGenreName('');}}>Cancel</button>
            </div>
          )}

          {selectedGenres.length > 0 && (
            <div className="selected-genres">
              {selectedGenres.map((genreId) => {
                const genre = genres.find(g => g.id === genreId);
                return genre ? (
                  <span key={genreId} className="genre-tag">
                    {genre.name}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveGenre(genreId)}
                      className="remove-genre"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="year">Year {!isEditMode && '*'}</label>
          <input
            id="year"
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Release Date {!isEditMode && '*'}</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail {!isEditMode && '*'}</label>
          <input
            id="thumbnail"
            type="file"
            name="thumbnail"
            onChange={handleFileChange}
            accept="image/*"
            required={!isEditMode}
          />
        </div>

        <div className="form-group">
          <label htmlFor="video">Video {!isEditMode && '*'}</label>
          <input
            id="video"
            type="file"
            name="video"
            onChange={handleFileChange}
            accept="video/*"
            required={!isEditMode}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Movie' : 'Create Movie')}
        </button>
      </form>
    </div>
  );
}

export default CreateMovie;
