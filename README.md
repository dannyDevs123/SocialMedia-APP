# Social Media Platform

A full-stack mini social media application built with React, Node.js, Express, and MongoDB.

## Features

- JWT Authentication (Access + Refresh Tokens)
- User Registration & Login with bcrypt password hashing
- Profile Management (Bio, Avatar, Display Name)
- Follow/Unfollow System with Followers/Following lists
- Text-based Posts (500 char limit, editable within 5 min)
- Comments with Nested Replies
- Like/Unlike with User List Modal
- Global & Following Feeds with Infinite Scroll
- Responsive Mobile-First Design with Tailwind CSS
- Security: Helmet, CORS, Rate Limiting, XSS Protection, Mongo Sanitize

## Tech Stack

**Frontend:** React 18, React Router v6, Axios, React Hook Form, Yup, Tailwind CSS, React Toastify
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, express-validator
**Database:** MongoDB Atlas

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Extract the ZIP
Extract the ZIP file and navigate to the project folder (`social-media-app`).

### 2. Install Dependencies (Monorepo)
From the project root:
```bash
npm install
```

This installs dependencies for both the frontend and backend workspaces.

### 3. Environment Variables
The `.env` file lives at the **project root** (not inside `backend/`):
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_here_2024_social_media_platform
JWT_REFRESH_SECRET=your_refresh_secret_here_2024_social_media_platform
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
BCRYPT_ROUNDS=10
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Start the Backend
From the project root:
```bash
npm run dev:backend
# or
npm run start:backend
```
Server runs on http://localhost:5000

### 5. Start the Frontend
From the project root (in a separate terminal):
```bash
npm run start:frontend
```
Frontend runs on http://localhost:3000

Alternatively, run each workspace directly:
```bash
cd backend && npm run dev
cd frontend && npm start
```

## API Documentation

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/refresh-token | Refresh JWT access token |
| POST | /api/auth/logout | Logout user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |

### Post Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/posts | Create post |
| GET | /api/posts | Global feed |
| GET | /api/posts/feed | Following feed (auth required) |
| GET | /api/posts/:id | Single post |
| PUT | /api/posts/:id | Update post (5 min window) |
| DELETE | /api/posts/:id | Delete post |
| GET | /api/posts/user/:userId | User's posts |

### Comment Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/posts/:postId/comments | Add comment |
| GET | /api/posts/:postId/comments | Get comments |
| PUT | /api/comments/:id | Update comment |
| DELETE | /api/comments/:id | Delete comment |

### Like Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/posts/:postId/like | Toggle like |
| GET | /api/posts/:postId/like | Get likers |

### Follow Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users/:userId/follow | Toggle follow |
| GET | /api/users/:userId/followers | Get followers |
| GET | /api/users/:userId/following | Get following |
| GET | /api/users/:userId/follow-status | Check follow status |

## Deployment

### Backend (e.g., Render, Railway, Heroku)
1. Set environment variables in hosting dashboard
2. Ensure `NODE_ENV=production`
3. Set `CLIENT_URL` to your frontend domain

### Frontend (e.g., Vercel, Netlify)
1. Build: `npm run build`
2. Set environment variable: `REACT_APP_API_URL=https://your-api-domain.com/api`
3. Deploy the `build/` folder

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check IP whitelist in MongoDB Atlas |
| CORS errors | Verify `CLIENT_URL` matches frontend origin |
| JWT expired | Token auto-refreshes via interceptor |
| 401 errors | Check localStorage token, login again |
| Build fails | Delete node_modules and run `npm install` |

## Security Features
- Passwords hashed with bcrypt (10 rounds)
- JWT stored in httpOnly cookies + localStorage fallback
- Rate limiting: 100 requests per 15 minutes
- Helmet headers for security
- MongoDB sanitization against injection
- XSS protection
- CORS configured for production
