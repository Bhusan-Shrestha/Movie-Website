import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  register: (userData) => {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('phone', userData.phone);
    formData.append('password', userData.password);
    formData.append('address', userData.address);
    formData.append('role', userData.role || 'VIEWER');
    return api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Movie APIs
export const movieAPI = {
  getAllMovies: (page = 0, size = 10, sortBy = 'createdAt', direction = 'DESC') => {
    return api.get('/movies/all', {
      params: { page, size, sortBy, direction },
    });
  },

  searchMovies: (title, page = 0, size = 10) => {
    return api.get('/movies/search', {
      params: { title, page, size },
    });
  },

  getTopRatedMovies: (page = 0, size = 10) => {
    return api.get('/movies/top-rated', {
      params: { page, size },
    });
  },

  getMovieById: (id) => api.get(`/movies/${id}`),

  createMovie: (movieData) => {
    const formData = new FormData();
    formData.append('thumbnail', movieData.thumbnail);
    formData.append('video', movieData.video);
    formData.append('title', movieData.title);
    if (movieData.description) formData.append('description', movieData.description);
    if (movieData.language) formData.append('language', movieData.language);
    if (movieData.runtimeMinutes) formData.append('runtimeMinutes', movieData.runtimeMinutes);
    if (movieData.casts) formData.append('casts', movieData.casts);
    if (movieData.genreIds) formData.append('genreIds', movieData.genreIds);
    if (movieData.year) formData.append('year', movieData.year);
    if (movieData.date) formData.append('date', movieData.date);
    return api.post('/movies', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateMovie: (id, movieData) => {
    const formData = new FormData();
    if (movieData.thumbnail) formData.append('thumbnail', movieData.thumbnail);
    if (movieData.video) formData.append('video', movieData.video);
    if (movieData.title) formData.append('title', movieData.title);
    if (movieData.description) formData.append('description', movieData.description);
    if (movieData.language) formData.append('language', movieData.language);
    if (movieData.runtimeMinutes) formData.append('runtimeMinutes', movieData.runtimeMinutes);
    if (movieData.casts) formData.append('casts', movieData.casts);
    if (movieData.genreIds) formData.append('genreIds', movieData.genreIds);
    if (movieData.year) formData.append('year', movieData.year);
    if (movieData.date) formData.append('date', movieData.date);
    return api.put(`/movies/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteMovie: (id) => api.delete(`/movies/${id}`),

  approveMovie: (id) => api.post(`/movies/approve/${id}`),

  resubmitRejectedMovie: (id) => api.post(`/movies/${id}/resubmit`),
};

// Genre APIs
export const genreAPI = {
  getAllGenres: () => api.get('/genres'),

  getGenreById: (id) => api.get(`/genres/${id}`),

  createGenre: (name, description) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    return api.post('/genres', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateGenre: (id, name, description) => {
    const formData = new FormData();
    if (name) formData.append('name', name);
    if (description) formData.append('description', description);
    return api.put(`/genres/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteGenre: (id) => api.delete(`/genres/${id}`),
};

// Review APIs
export const reviewAPI = {
  getReviewsByMovie: (movieId) => api.get(`/reviews/movie/${movieId}`),

  getReviewsByUser: (userId) => api.get(`/reviews/user/${userId}`),

  addReview: (movieId, reviewText, rating) => {
    const formData = new FormData();
    formData.append('reviewText', reviewText);
    formData.append('rating', rating);
    return api.post(`/reviews/add/${movieId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateReview: (reviewId, reviewText, rating) => {
    const formData = new FormData();
    if (reviewText) formData.append('reviewText', reviewText);
    if (rating) formData.append('rating', rating);
    return api.put(`/reviews/${reviewId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// User APIs
export const userAPI = {
  getAllUsers: () => api.get('/user/all'),

  getUserById: (id) => api.get(`/user/${id}`),

  getCurrentUserProfile: () => api.get('/user/profile'),

  updateProfile: (userData) => {
    const formData = new FormData();
    if (userData.name) formData.append('name', userData.name);
    if (userData.email) formData.append('email', userData.email);
    if (userData.phone) formData.append('phone', userData.phone);
    if (userData.address) formData.append('address', userData.address);
    return api.put('/user/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateUser: (id, userData) => {
    const formData = new FormData();
    if (userData.name) formData.append('name', userData.name);
    if (userData.email) formData.append('email', userData.email);
    if (userData.phone) formData.append('phone', userData.phone);
    if (userData.address) formData.append('address', userData.address);
    return api.put(`/user/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Admin APIs
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),

  getUserById: (id) => api.get(`/admin/users/${id}`),

  updateUser: (id, userData) => {
    const formData = new FormData();
    if (userData.name) formData.append('name', userData.name);
    if (userData.username) formData.append('username', userData.username);
    if (userData.email) formData.append('email', userData.email);
    if (userData.phone) formData.append('phone', userData.phone);
    if (userData.address) formData.append('address', userData.address);
    if (userData.role) formData.append('role', userData.role);
    return api.put(`/admin/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getPendingMovies: () => api.get('/approvals/pending/movies'),

  getPendingRequests: () => api.get('/approvals/pending/requests'),

  approveMovie: (id) => api.post(`/approvals/movies/${id}/approve`),

  rejectMovie: (id) => api.post(`/approvals/movies/${id}/reject`),

  approveRequest: (id) => api.post(`/approvals/requests/${id}/approve`),

  rejectRequest: (id) => api.post(`/approvals/requests/${id}/reject`),
};

export default api;
