# MoviesDB Frontend - Complete Setup Guide

A modern, responsive React application for browsing, uploading, and managing movies with advanced features like authentication, reviews, ratings, and role-based access control.

> **🔗 Looking for the Backend?** Check out the working Spring Boot API here: [Movie API](https://github.com/Bhusan-Shrestha/Movie-API)

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Development Server](#running-development-server)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

The **MoviesDB Frontend** is a modern React application that provides a user interface for the movies management system. Built with React 18, Redux Toolkit, and React Router, it offers a responsive and interactive experience.

### Key Features:
- 🎬 Movie browsing with search and filters
- 👤 User authentication with JWT
- ⭐ Reviews and ratings system
- 📤 Movie upload functionality
- 🎨 Responsive design
- 👥 Role-based dashboards (Viewer, Moderator, Admin)
- 📱 Mobile-friendly UI

### Technology Stack:
- **React 18**: UI library
- **Redux Toolkit**: State management
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **CSS3**: Styling
- **Node.js**: Runtime
- **npm**: Package manager

---

## 📦 Prerequisites

### System Requirements:
- **OS**: Windows, macOS, or Linux
- **RAM**: 2GB minimum (4GB recommended)
- **Disk Space**: 1GB minimum

### Required Software:

#### Node.js & npm

**Windows:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Use LTS (Long Term Support) version recommended
3. Run installer
4. Accept default installation
5. npm is included with Node.js

**macOS:**
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm
```

**Verify Installation:**
```bash
node --version
npm --version

# Expected output:
# v20.11.0
# 10.5.0
```

### Check npm Registry (Optional):
```bash
npm config get registry
# Should output: https://registry.npmjs.org/

# If not, set to default:
npm config set registry https://registry.npmjs.org/
```

---

## 📥 Installation

### Step 1: Navigate to Frontend Directory
```bash
cd moviesapp
```

### Step 2: Install Dependencies

```bash
# Standard installation
npm install

# If you encounter peer dependency warnings:
npm install --legacy-peer-deps

# For faster installation:
npm ci  # Uses exact versions from package-lock.json
```

**Expected Output:**
```
added X packages in Xs
```

### Step 3: Verify Installation

```bash
# Check installed packages
npm list --depth=0

# Should show:
# moviesapp@0.1.0
# ├── react@18.x.x
# ├── react-dom@18.x.x
# ├── react-router-dom@6.x.x
# ├── @reduxjs/toolkit@1.x.x
# ├── react-redux@8.x.x
# ├── axios@1.x.x
# └── ... other packages
```

---

## ⚙️ Configuration

### Step 1: API Endpoint Configuration

Edit `src/services/api.js`:

```javascript
import axios from 'axios';

// Set backend API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Step 2: Environment Configuration (Optional)

Create `.env` file in project root:

```bash
# Backend API Configuration
REACT_APP_API_URL=http://localhost:8080/api

# Optional settings
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

**Note:** 
- Variables must start with `REACT_APP_`
- Restart dev server after changing `.env`

### Step 3: Redux Configuration

Redux store is already configured in `src/redux/store.js`:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import movieReducer from './slices/movieSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: movieReducer,
    ui: uiReducer,
  },
});
```

---

## 🚀 Running Development Server

### Start Development Server

```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view moviesapp in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://YOUR_IP:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

### Access the Application

1. Open browser
2. Navigate to `http://localhost:3000`
3. Application loads automatically
4. HMR (Hot Module Replacement) enabled - changes update instantly

### First Time Login

1. Click "Register" to create new account
2. Fill in user details:
   - Name
   - Username
   - Email
   - Phone
   - Password
   - Address
3. Select role (VIEWER, MODERATOR, ADMIN)
4. Click "Register"
5. Login with credentials

---

## 🏗️ Building for Production

### Step 1: Create Optimized Build

```bash
npm run build
```

**What it does:**
- Minifies code
- Optimizes assets
- Creates bundle report
- Generates source maps

**Expected Output:**
```
> react-scripts build

Creating an optimized production build...
Compiled successfully.

File sizes after gzip:

  XX.XX KB  build/static/js/main.XXXXX.js
  X.XX KB   build/static/css/main.XXXXX.css
```

### Step 2: Verify Build Output

```bash
# Check build directory
ls -la build/

# Should contain:
# ├── index.html
# ├── manifest.json
# ├── robots.txt
# ├── favicon.ico
# └── static/
#     ├── css/
#     ├── js/
#     └── media/
```

### Step 3: Test Production Build Locally

```bash
# Install http-server globally
npm install -g http-server

# Or use npx (no installation needed)
npx serve -s build

# Open: http://localhost:3000 or http://localhost:5000
```

### Step 4: Deploy Build

**Option 1: Netlify**
```bash
# Install netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=build
```

**Option 2: Vercel**
```bash
# Install vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Option 3: Manual (Any Web Server)**
- Upload contents of `build/` directory
- To any web hosting or static file server
- Configure server to serve `index.html` for all routes (for React Router)

---

## 📁 Project Structure

```
moviesapp/
├── public/
│   ├── index.html              # Main HTML file
│   ├── favicon.ico             # Browser tab icon
│   └── manifest.json           # PWA manifest
│
├── src/
│   ├── assets/                 # Images, icons, fonts
│   │   └── [image files]
│   │
│   ├── components/             # React components
│   │   ├── Login.js            # Login form component
│   │   ├── Register.js         # Registration form
│   │   ├── MovieList.js        # Movies listing with pagination
│   │   ├── MovieDetail.js      # Individual movie details
│   │   ├── AdminDashboard.js   # Admin management panel
│   │   ├── ModeratorDashboard.js  # Moderator panel
│   │   ├── UserDashboard.js    # User profile/dashboard
│   │   ├── Profile.js          # User profile view
│   │   ├── CreateMovie.js      # Movie upload form
│   │   └── Auth.css            # Auth components styles
│   │
│   ├── redux/                  # Redux state management
│   │   ├── store.js            # Redux store configuration
│   │   └── slices/
│   │       ├── authSlice.js    # Authentication state
│   │       ├── movieSlice.js   # Movies state
│   │       └── uiSlice.js      # UI state (modals, notifications)
│   │
│   ├── services/               # API services
│   │   └── api.js              # Axios instance & API calls
│   │
│   ├── styles/                 # Global and component styles
│   │   ├── [component-specific CSS]
│   │   └── index.css           # Global styles
│   │
│   ├── App.js                  # Main app component
│   ├── App.css                 # App styles
│   ├── index.js                # Entry point
│   ├── index.css               # Global styles
│   └── reportWebVitals.js      # Performance monitoring
│
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies & scripts
└── package-lock.json           # Dependency lock file
```

---

## 💻 Development Workflow

### Available npm Scripts

```bash
# Start development server
npm start
# Runs app in development mode at http://localhost:3000
# Hot reload enabled

# Build for production
npm run build
# Creates optimized production build in build/ directory

# Run tests
npm test
# Launches test runner in interactive watch mode
# Press 'a' to run all tests
# Press 'q' to quit

# Eject configuration (⚠️ one-way operation)
npm run eject
# Exposes Create React App configuration
# Only use if you need full control
# This is irreversible!
```

### Development Tips

1. **Use Browser DevTools:**
   - React Developer Tools extension
   - Redux DevTools extension
   - Network tab for API debugging

2. **Console Debugging:**
   - `console.log()` for values
   - `debugger;` statement for breakpoints
   - F12 to open DevTools

3. **Component Organization:**
   - One component per file
   - Related styles in same directory
   - Keep components small and focused

4. **Redux Usage:**
   - Use slices for actions and reducers
   - Use `useSelector` to read state
   - Use `useDispatch` to dispatch actions

5. **Styling:**
   - Keep component CSS adjacent to component
   - Use consistent naming conventions
   - Mobile-first responsive design

### Code Style

- **Formatting:** Use Prettier (if configured)
- **Linting:** Use ESLint (if configured)
- **Naming:** Use camelCase for variables/functions
- **Comments:** Write meaningful comments for complex logic

---

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Watch Mode

```bash
# Automatically re-run tests when files change
npm test -- --watch
```

### Coverage Report

```bash
npm test -- --coverage
```

### Run Specific Test

```bash
npm test MovieList.test.js
```

---

## 🐛 Troubleshooting

### Issue 1: Port 3000 Already in Use
**Error:** `Something is already running on port 3000`

**Solutions:**

**Windows:**
```bash
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find process on port 3000
lsof -i :3000

# Kill process (replace PID)
kill -9 <PID>
```

**Or use different port:**
```bash
# Windows
set PORT=3001 && npm start

# macOS/Linux
PORT=3001 npm start
```

### Issue 2: Dependencies Installation Fails
**Error:** `npm ERR! code ERESOLVE` or peer dependency conflicts

**Solutions:**

```bash
# Option 1: Use legacy peer deps
npm install --legacy-peer-deps

# Option 2: Clear npm cache
npm cache clean --force
npm install

# Option 3: Delete and reinstall
rm -rf node_modules package-lock.json
npm install

# Option 4: Use Node 18+ (better dependency resolution)
node --version  # Check version
```

### Issue 3: API Connection Errors
**Error:** `Cannot connect to backend` or `404 errors`

**Solutions:**

1. **Verify backend is running:**
   ```bash
   curl http://localhost:8080/api/health
   # Or: Invoke-WebRequest http://localhost:8080/api/health
   ```

2. **Check API URL in `src/services/api.js`:**
   ```javascript
   const API_BASE_URL = 'http://localhost:8080/api';
   ```

3. **Check `.env` file:**
   ```bash
   REACT_APP_API_URL=http://localhost:8080/api
   ```

4. **Check browser console for CORS errors:**
   - Open DevTools (F12)
   - Look for CORS policy errors
   - If backend not allowing CORS, it needs to be fixed on backend

5. **Restart dev server:**
   ```bash
   # Stop with Ctrl+C
   # Then restart
   npm start
   ```

### Issue 4: Build Fails
**Error:** `Compilation failed` or build errors

**Solutions:**

```bash
# Clean cache
npm cache clean --force

# Clear node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Try build again
npm run build
```

### Issue 5: Hot Reload Not Working
**Error:** Changes not reflecting in browser

**Solutions:**

1. Save file (Ctrl+S)
2. Check file was saved
3. Check terminal for compilation errors
4. Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
5. Restart dev server

### Issue 6: Authentication Token Issues
**Error:** `401 Unauthorized` or `Token expired`

**Solutions:**

1. **Clear localStorage:**
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

2. **Check token storage:**
   ```javascript
   console.log(localStorage.getItem('token'));
   ```

3. **Verify token format:**
   - Should be JWT format with 3 parts (header.payload.signature)
   - Starts with "Bearer " in Authorization header

4. **Check token expiration:**
   - Tokens expire after 24 hours by default
   - Need to login again after expiration

### Issue 7: Redux State Issues
**Error:** `Cannot read property of undefined` or state is empty

**Solutions:**

1. **Install Redux DevTools:**
   - Chrome/Firefox browser extension
   - Time-travel debugging and state inspection

2. **Check selectors:**
   ```javascript
   import { useSelector } from 'react-redux';
   
   // Verify state path
   const movies = useSelector(state => state.movies.movies);
   console.log(movies);  // Check if defined
   ```

3. **Check reducers:**
   - Verify initial state is set
   - Actions are spelled correctly
   - Reducers handle all action types

### Issue 8: Styling/CSS Not Applying
**Error:** Styles not loading or appearing

**Solutions:**

1. **Check CSS file import:**
   ```javascript
   import './ComponentName.css';
   ```

2. **Check class names match:**
   ```javascript
   <div className="movie-list">  {/* CSS class */}
   ```
   ```css
   .movie-list {
     /* styles */
   }
   ```

3. **CSS specificity issues:**
   - Use more specific selectors
   - Or use `!important` (sparingly)

4. **Build/reload cache:**
   ```bash
   npm start
   # Hard refresh: Ctrl+Shift+R
   ```

---

## 📱 Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Latest versions

---

## 🔒 Security Best Practices

1. **Never commit secrets:**
   - Remove API keys from code
   - Use `.env` files
   - Add `.env` to `.gitignore`

2. **HTTPS in production:**
   - Always use HTTPS
   - Update API_BASE_URL to https://

3. **Token management:**
   - Store JWT securely
   - Remove on logout
   - Handle expiration gracefully

4. **CORS:**
   - Only allow trusted origins
   - Don't use `*` in production

5. **Input validation:**
   - Validate user inputs
   - Sanitize before rendering
   - Use `dangerouslySetInnerHTML` sparingly

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Redux Documentation](https://redux.js.org)
- [React Router Documentation](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)
- [Create React App Documentation](https://create-react-app.dev)
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/YourFeature`
2. Make changes
3. Test thoroughly: `npm test`
4. Commit: `git commit -am 'Add YourFeature'`
5. Push: `git push origin feature/YourFeature`
6. Open Pull Request

---

**Happy coding! 🎉**

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
