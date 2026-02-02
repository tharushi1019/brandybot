# BrandyBot Backend API

Backend API server for BrandyBot - AI-Powered Branding Platform

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Firebase Admin SDK
- **Environment:** dotenv

## Project Structure

```
backend/
├── config/          # Configuration files (database, etc.)
├── controllers/     # Request handlers
├── middleware/      # Custom middleware (auth, error handling, etc.)
├── models/          # Database models
├── routes/          # API route definitions
├── services/        # Business logic
├── utils/           # Helper functions
├── .env             # Environment variables (not in git)
├── .env.example     # Environment template
├── server.js        # Main application entry point
└── package.json     # Dependencies and scripts
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Update the values with your actual configuration

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Run Production Server**
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- `GET /` - API information
- `GET /health` - Health check endpoint

### Authentication (Coming Soon)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify` - Verify Firebase token

### Logo Generation (Coming Soon)
- `POST /api/logos/generate` - Generate new logo
- `GET /api/logos/history` - Get user's logo history
- `GET /api/logos/:id` - Get specific logo

### Brand Guidelines (Coming Soon)
- `POST /api/guidelines/generate` - Generate brand guidelines
- `GET /api/guidelines/:id` - Get specific guidelines

### Mockups (Coming Soon)
- `POST /api/mockups/generate` - Generate mockups
- `GET /api/mockups/:id` - Get specific mockup

### Chatbot (Coming Soon)
- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/history` - Get chat history

### User Profile (Coming Soon)
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/stats` - Get user statistics

## Environment Variables

See `.env.example` for all required environment variables.

## Development

- The server runs on port 5000 by default
- Uses nodemon for auto-restart during development
- CORS enabled for frontend communication

## Status

✅ **Step 1 Complete:** Backend foundation initialized with Express.js server

**Next Steps:**
- Configure environment variables validation
- Set up MongoDB connection
- Implement error handling middleware
- Configure security and CORS
