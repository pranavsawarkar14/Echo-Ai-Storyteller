# Echo Stories Backend API

A Node.js/Express backend API for the Echo Stories app with Clerk authentication and MongoDB storage.

## Features

- **Authentication**: Clerk JWT token authentication
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, rate limiting
- **Admin Panel**: Full admin functionality for story moderation
- **Analytics**: Story and user analytics
- **Story Management**: CRUD operations for stories
- **Moderation**: Story approval/rejection system

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- MongoDB running locally or MongoDB Atlas account
- Clerk account and API keys

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your values:
- `MONGODB_URI`: Your MongoDB connection string
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `ADMIN_USER_IDS`: Comma-separated list of admin user IDs

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
All endpoints except `/api/health` require a valid Clerk JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### Stories (`/api/stories`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/stories` | Get user's stories | User |
| POST | `/api/stories` | Create new story | User |
| GET | `/api/stories/:id` | Get specific story | User |
| PATCH | `/api/stories/:id` | Update story | Owner |
| DELETE | `/api/stories/:id` | Delete story | Owner |
| GET | `/api/stories/public/search` | Search public stories | Public |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/analytics` | Get analytics data | Admin |
| GET | `/api/admin/stories/all` | Get all stories | Admin |
| GET | `/api/admin/stories/pending` | Get pending moderation | Admin |
| POST | `/api/admin/stories/:id/moderate` | Approve/reject story | Admin |
| DELETE | `/api/admin/stories/:id` | Delete any story | Admin |
| PATCH | `/api/admin/stories/:id` | Update any story | Admin |
| GET | `/api/admin/users/stats` | Get user statistics | Admin |

### Health (`/api/health`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | General health check | None |
| GET | `/api/health/db` | Database health check | None |

## Data Models

### Story
```javascript
{
  title: String,           // Required, max 200 chars
  content: String,         // Required, max 50,000 chars
  category: String,        // Adventure, Mystery, Sci-Fi, etc.
  duration: String,        // "Short (5-10 min)", etc.
  description: String,     // Required, max 500 chars
  chapters: [Chapter],     // Array of chapter objects
  author: String,          // Default: "Echo AI"
  userId: String,          // Required, from Clerk auth
  moderationStatus: String, // pending, approved, rejected
  isPublic: Boolean,       // Default: false
  playCount: Number,       // Default: 0
  generationParams: Object, // AI generation parameters
  createdAt: Date,
  updatedAt: Date
}
```

### Chapter
```javascript
{
  title: String,
  text: String,
  image: String // Optional
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/echo-stories |
| `CLERK_SECRET_KEY` | Clerk secret key | Required |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Required |
| `NODE_ENV` | Environment | development |
| `ADMIN_USER_IDS` | Comma-separated admin user IDs | Empty |
| `RATE_LIMIT_WINDOW` | Rate limit window (minutes) | 15 |
| `RATE_LIMIT_MAX` | Max requests per window | 100 |
| `CORS_ORIGINS` | Allowed CORS origins | localhost URLs |

## Security Features

- **JWT Authentication**: All protected endpoints require valid Clerk tokens
- **Rate Limiting**: 100 requests per 15-minute window per IP
- **CORS**: Configurable allowed origins
- **Helmet**: Security headers
- **Input Validation**: Mongoose schema validation
- **Admin Protection**: Admin endpoints require specific user IDs

## Error Handling

The API returns consistent error responses:

```javascript
{
  success: false,
  error: "error_type",
  message: "Human readable message"
}
```

Common error codes:
- `401`: Authentication required
- `403`: Access denied (admin required)
- `404`: Resource not found
- `400`: Validation error
- `429`: Rate limit exceeded
- `500`: Internal server error

## Development

### Scripts

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm test         # Run tests (not implemented yet)
```

### Database Setup

Make sure MongoDB is running locally or set up MongoDB Atlas:

1. **Local MongoDB**:
   ```bash
   # Install MongoDB Community Edition
   # Start the service
   mongod
   ```

2. **MongoDB Atlas**:
   - Create cluster at mongodb.com
   - Get connection string
   - Update `MONGODB_URI` in `.env`

### Adding Admin Users

1. Create user account in your app
2. Copy the Clerk user ID from Clerk Dashboard
3. Add user ID to `ADMIN_USER_IDS` in `.env`:
   ```
   ADMIN_USER_IDS=user_2abc123,user_3def456
   ```
4. Restart the server

## Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use production MongoDB URI
3. Set appropriate CORS origins
4. Configure rate limiting for production load

### Recommended Services

- **Hosting**: Railway, Render, or AWS EC2
- **Database**: MongoDB Atlas
- **Monitoring**: Add logging service (Winston, Logtail)
- **Caching**: Redis for session management (optional)

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

MIT License - see LICENSE file for details