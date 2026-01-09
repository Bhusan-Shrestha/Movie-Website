# MoviesDB - Complete Setup & Deployment Guide

## 🚀 Project Overview

**MoviesDB** is a comprehensive movie streaming platform with:
- ✨ React 18 responsive frontend
- 🔐 Spring Boot 3.5 backend with JWT authentication
- 🗄️ PostgreSQL database
- 👥 Role-based access control (VIEWER, MODERATOR, ADMIN)
- 🎨 Modern, interactive UI with animations

---

## 📋 Prerequisites

### System Requirements:
- **Node.js**: v14+ (with npm v6+)
- **Java**: JDK 17+
- **Maven**: 3.8+
- **PostgreSQL**: 12+
- **RAM**: 2GB minimum
- **Disk**: 500MB minimum

### Installation Check:
```powershell
# Check Node.js and npm
node --version
npm --version

# Check Java
java -version

# Check Maven
mvn --version

# Check PostgreSQL
psql --version
```

---

## 🗄️ Part 1: Database Setup

### Step 1: Create PostgreSQL Database

```sql
-- Connect to PostgreSQL as admin
psql -U postgres

-- Create database user
CREATE USER movieuser WITH PASSWORD 'your_password';

-- Create database
CREATE DATABASE moviesdb OWNER movieuser;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE moviesdb TO movieuser;

-- Connect to new database
\c moviesdb

-- Create schema
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL PRIVILEGES ON SCHEMA public TO movieuser;
```

### Step 2: Verify Database Connection

```sql
-- Test connection
psql -U movieuser -d moviesdb -h localhost

-- List tables (initially empty)
\dt

-- Exit
\q
```

---

## 🔧 Part 2: Backend Setup (Spring Boot)

### Step 1: Navigate to Backend Directory

```powershell
cd "d:\Work\Movies\moviesapi"
```

### Step 2: Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/moviesdb
spring.datasource.username=movieuser
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080
server.servlet.context-path=/api

# JWT Configuration
jwt.secret=your_jwt_secret_key_min_32_characters_long
jwt.expiration=86400000

# File Upload
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB

# Logging
logging.level.root=INFO
logging.level.com.movies.moviesapi=DEBUG
```

### Step 3: Build Backend

```powershell
# Install dependencies and build
mvn clean install

# Or use the wrapper
./mvnw clean install
```

### Step 4: Run Backend

```powershell
# Option 1: Using Maven
mvn spring-boot:run

# Option 2: Using Java directly
java -jar target/moviesapi-1.0.0.jar

# Backend will be available at http://localhost:8080/api
```

### Step 5: Verify Backend is Running

```powershell
# In another terminal, test the API
curl http://localhost:8080/api/health

# Or test authentication
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"test","password":"test"}'
```

---

## ⚛️ Part 3: Frontend Setup (React)

### Step 1: Navigate to Frontend Directory

```powershell
cd "d:\Work\Movies\moviesapp"
```

### Step 2: Install Dependencies

```powershell
npm install
```

### Step 3: Configure API Endpoint

Check `src/services/api.js` - ensure backend URL is correct:

```javascript
// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Step 4: Start Development Server

```powershell
npm start
```

**Frontend will open at**: http://localhost:3000

### Step 5: Verify Frontend is Working

- Page should load without errors
- Navigation bar should be visible
- Login/Register pages should be accessible

---

## 🎯 Part 4: Testing the Application

### Test 1: User Registration

1. Navigate to http://localhost:3000
2. Click "Register"
3. Select a role (Viewer, Moderator, or Admin)
4. Fill all required fields
5. Click "Create Account"
6. Verify success message

### Test 2: User Login

1. Click "Login"
2. Enter credentials from registration
3. Check "Remember me" (optional)
4. Click "Login"
5. Should redirect to home page

### Test 3: Role-Based Features

#### As VIEWER:
- Browse all movies
- Search and filter
- View movie details
- Write reviews

#### As MODERATOR:
- All VIEWER features
- Click "📤 Upload Movie"
- Upload movie with details
- Wait for approval

#### As ADMIN:
- All previous features
- Click "⚙️ Admin Panel"
- View dashboard stats
- Approve/reject pending movies
- Manage users
- Configure settings

### Test 4: API Endpoints

```powershell
# Get all movies
curl http://localhost:8080/api/movies

# Login
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"test_user","password":"password"}'

# Search movies
curl "http://localhost:8080/api/movies/search?q=action"

# Get top-rated movies
curl http://localhost:8080/api/movies/top-rated
```

---

## 📁 Project File Structure

```
d:\Work\Movies\
│
├── moviesapi/                          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/movies/moviesapi/
│   │   │   │   ├── MovieApiApplication.java
│   │   │   │   ├── config/              # Configuration classes
│   │   │   │   ├── controller/          # REST Controllers (7 files)
│   │   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   ├── entity/              # JPA Entities
│   │   │   │   ├── exception/           # Exception Handling
│   │   │   │   ├── repository/          # Data Access Layer
│   │   │   │   ├── security/            # Security & JWT
│   │   │   │   └── service/             # Business Logic
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application.yml
│   │   │       └── db/migration/        # Database migrations
│   │   └── test/
│   ├── pom.xml
│   ├── mvnw & mvnw.cmd
│   └── README.md
│
├── moviesapp/                          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Login.css
│   │   │   ├── Register.js
│   │   │   ├── Register.css
│   │   │   ├── MovieList.js
│   │   │   ├── MovieList.css
│   │   │   ├── MovieDetail.js
│   │   │   ├── MovieDetail.css
│   │   │   ├── CreateMovie.js
│   │   │   ├── CreateMovie.css
│   │   │   ├── AdminDashboard.js
│   │   │   └── ... other files
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── AdminDashboard.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── .gitignore
│   └── README.md
│
├── PROJECT_ENHANCEMENT_SUMMARY.md      # Enhancements overview
├── ROLE_BASED_FEATURES_GUIDE.md        # Role definitions
└── SETUP_AND_DEPLOYMENT.md            # This file
```

---

## 🐛 Troubleshooting

### Issue 1: Backend Connection Error

**Error**: `Could not proxy request ... to http://localhost:8080`

**Solution**:
1. Ensure backend is running: `mvn spring-boot:run`
2. Check if port 8080 is available
3. Verify API endpoint in `api.js`

### Issue 2: Database Connection Error

**Error**: `Connection refused to localhost:5432`

**Solution**:
1. Start PostgreSQL service
2. Verify credentials in `application.properties`
3. Check if database and user exist

### Issue 3: npm Dependencies Error

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```powershell
npm install --legacy-peer-deps
```

### Issue 4: Port Already in Use

**Error**: `port 3000 is already in use` or `port 8080 in use`

**Solution**:
```powershell
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Or use different port
npm start -- --port 3001
```

### Issue 5: Module Not Found

**Error**: `Can't resolve './Component'`

**Solution**:
1. Check file names (case-sensitive on Linux)
2. Verify import paths
3. Run `npm install` again

---

## 🔑 Default Credentials

### Demo Admin Account:
- **Username**: `admin`
- **Password**: `password`
- **Role**: ADMIN

### Create Test Account:
1. Go to http://localhost:3000/register
2. Choose a role
3. Fill all fields
4. Register successfully

---

## 📊 Database Schema

### Tables:
- `users` - User accounts with roles
- `movies` - Movie information and metadata
- `reviews` - User reviews and ratings
- `genres` - Movie genres
- `approval_requests` - Movie approval workflow
- `media` - Media files (thumbnails, videos)

---

## 🚀 Deployment Checklist

### Pre-Deployment:
- [ ] Database configured and migrated
- [ ] Backend builds successfully
- [ ] Frontend builds successfully
- [ ] All tests pass
- [ ] Environment variables set
- [ ] API endpoints documented
- [ ] Role-based access verified

### Deployment Steps:
- [ ] Build backend JAR file
- [ ] Build frontend static files
- [ ] Deploy to server
- [ ] Configure production database
- [ ] Update API endpoints
- [ ] Set JWT secret in production
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Set up logging
- [ ] Monitor application

### Post-Deployment:
- [ ] Verify all endpoints working
- [ ] Test user registration/login
- [ ] Test role-based features
- [ ] Monitor server logs
- [ ] Set up backup strategy
- [ ] Configure monitoring alerts

---

## 📝 API Documentation

### Authentication Endpoints:
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/validate      - Validate token
```

### Movie Endpoints:
```
GET    /api/movies             - Get all movies
GET    /api/movies/:id         - Get movie details
GET    /api/movies/search      - Search movies
GET    /api/movies/top-rated   - Get top-rated movies
POST   /api/movies             - Create movie (Moderator+)
PUT    /api/movies/:id         - Update movie
DELETE /api/movies/:id         - Delete movie
```

### Review Endpoints:
```
GET    /api/reviews/movie/:id  - Get reviews for movie
POST   /api/reviews            - Add review
PUT    /api/reviews/:id        - Update review
DELETE /api/reviews/:id        - Delete review
```

### Admin Endpoints:
```
GET    /api/admin/pending-movies    - List pending movies
POST   /api/admin/movies/:id/approve - Approve movie
DELETE /api/admin/movies/:id        - Reject movie
GET    /api/users                   - Get all users
```

---

## 🎓 Learning Resources

### Frontend (React):
- React Hooks: useState, useEffect, useContext
- React Router: Navigation and route protection
- Axios: HTTP client for API calls
- CSS: Responsive design with media queries

### Backend (Spring Boot):
- Spring Security: JWT authentication
- Spring Data JPA: Database operations
- REST Controllers: API endpoints
- Exception Handling: Global error handling

### Database (PostgreSQL):
- Schema design
- Migrations
- Query optimization

---

## 💡 Tips & Best Practices

### Frontend:
1. Keep components small and focused
2. Use custom hooks for shared logic
3. Implement proper error boundaries
4. Optimize images and assets
5. Use lazy loading for routes

### Backend:
1. Use DTOs for API responses
2. Implement proper exception handling
3. Add logging for debugging
4. Use database indexes
5. Validate all inputs

### Security:
1. Never commit secrets to git
2. Use environment variables
3. Validate all API inputs
4. Implement rate limiting
5. Use HTTPS in production
6. Rotate JWT secrets regularly

---

## 📞 Support & Resources

### Common Issues:
- Check [Troubleshooting](#-troubleshooting) section
- Review project documentation files
- Check console logs for errors

### Additional Resources:
- React Documentation: https://react.dev
- Spring Boot Docs: https://spring.io/projects/spring-boot
- PostgreSQL Docs: https://www.postgresql.org/docs

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend running on http://localhost:8080/api
- [ ] Frontend running on http://localhost:3000
- [ ] Database connected
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can view movies
- [ ] Role-based features working
- [ ] Admin panel accessible
- [ ] No console errors

---

## 🎉 You're All Set!

Your MoviesDB application is now ready for:
- ✅ Development
- ✅ Testing
- ✅ Deployment
- ✅ Production use

**Happy coding! 🚀**

---

**Last Updated**: 2024  
**Version**: 1.0  
**Status**: Production Ready ✅

