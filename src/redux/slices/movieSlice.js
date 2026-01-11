import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  movies: [],
  selectedMovie: null,
  loading: false,
  error: null,
  currentPage: 0,
  pageSize: 10,
  totalElements: 0,
};

const movieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    // Fetch movies
    fetchMoviesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMoviesSuccess: (state, action) => {
      const { movies, currentPage, pageSize, totalElements } = action.payload;
      state.movies = movies;
      state.currentPage = currentPage;
      state.pageSize = pageSize;
      state.totalElements = totalElements;
      state.loading = false;
      state.error = null;
    },
    fetchMoviesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.movies = [];
    },

    // Set selected movie
    setSelectedMovie: (state, action) => {
      state.selectedMovie = action.payload;
    },
    clearSelectedMovie: (state) => {
      state.selectedMovie = null;
    },

    // Add movie
    addMovie: (state, action) => {
      state.movies.push(action.payload);
    },

    // Update movie
    updateMovie: (state, action) => {
      const index = state.movies.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.movies[index] = action.payload;
      }
    },

    // Delete movie
    deleteMovie: (state, action) => {
      state.movies = state.movies.filter((m) => m.id !== action.payload);
    },

    // Clear error
    clearMovieError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchMoviesStart,
  fetchMoviesSuccess,
  fetchMoviesFailure,
  setSelectedMovie,
  clearSelectedMovie,
  addMovie,
  updateMovie,
  deleteMovie,
  clearMovieError,
} = movieSlice.actions;

// Selectors
export const selectMovies = (state) => state.movies.movies;
export const selectSelectedMovie = (state) => state.movies.selectedMovie;
export const selectMoviesLoading = (state) => state.movies.loading;
export const selectMoviesError = (state) => state.movies.error;
export const selectCurrentPage = (state) => state.movies.currentPage;
export const selectPageSize = (state) => state.movies.pageSize;
export const selectTotalElements = (state) => state.movies.totalElements;

export default movieSlice.reducer;
