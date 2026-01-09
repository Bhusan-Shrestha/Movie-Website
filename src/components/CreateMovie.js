import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieAPI } from '../services/api';
import './CreateMovie.css';

function CreateMovie() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'Hindi',
    runtimeMinutes: 120,
    casts: '',
    genreIds: '',
    year: new Date().getFullYear(),
    date: '',
    thumbnail: null,
    video: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    if (!formData.title || !formData.thumbnail || !formData.video) {
      setError('Title, thumbnail, and video are required');
      return;
    }

    setLoading(true);
    try {
      await movieAPI.createMovie(formData);
      alert('Movie created successfully! It will be pending approval.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-movie-container">
      <h1>Create New Movie</h1>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="movie-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="runtimeMinutes">Runtime (minutes)</label>
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
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="language">Language</label>
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
          <label htmlFor="casts">Casts</label>
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
          <label htmlFor="genreIds">Genre IDs</label>
          <input
            id="genreIds"
            type="text"
            name="genreIds"
            value={formData.genreIds}
            onChange={handleChange}
            placeholder="1,2,3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input
            id="year"
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Release Date</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail *</label>
          <input
            id="thumbnail"
            type="file"
            name="thumbnail"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="video">Video *</label>
          <input
            id="video"
            type="file"
            name="video"
            onChange={handleFileChange}
            accept="video/*"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Movie'}
        </button>
      </form>
    </div>
  );
}

export default CreateMovie;
