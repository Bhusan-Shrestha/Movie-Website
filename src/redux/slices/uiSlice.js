import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mobileMenuOpen: false,
  message: '',
  messageType: 'success', // 'success' or 'error'
  showMessage: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toggle mobile menu
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },

    // Show message
    showSuccessMessage: (state, action) => {
      state.message = action.payload;
      state.messageType = 'success';
      state.showMessage = true;
    },
    showErrorMessage: (state, action) => {
      state.message = action.payload;
      state.messageType = 'error';
      state.showMessage = true;
    },

    // Clear message
    clearMessage: (state) => {
      state.message = '';
      state.showMessage = false;
    },
  },
});

export const {
  toggleMobileMenu,
  setMobileMenuOpen,
  showSuccessMessage,
  showErrorMessage,
  clearMessage,
} = uiSlice.actions;

// Selectors
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectMessage = (state) => state.ui.message;
export const selectMessageType = (state) => state.ui.messageType;
export const selectShowMessage = (state) => state.ui.showMessage;

export default uiSlice.reducer;
