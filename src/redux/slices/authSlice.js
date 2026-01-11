import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('authToken') || null,
  isLoggedIn: !!localStorage.getItem('authToken'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login action
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.isLoggedIn = true;
      state.user = user;
      state.loading = false;
      state.error = null;
      // Persist to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.token = null;
      state.isLoggedIn = false;
      state.user = null;
    },

    // Logout action
    logout: (state) => {
      state.token = null;
      state.isLoggedIn = false;
      state.user = null;
      state.loading = false;
      state.error = null;
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },

    // Update user profile
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, clearError } = authSlice.actions;

// Selectors
export const selectToken = (state) => state.auth.token;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
