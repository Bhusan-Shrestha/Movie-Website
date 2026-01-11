import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import movieReducer from './slices/movieSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    movies: movieReducer,
  },
});

export default store;
