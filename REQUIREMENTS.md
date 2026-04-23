# Project Requirements: Portfolio & Dashboard

To ensure the backend and authentication systems work perfectly, you need the following setup:

## 1. Database (MongoDB)
The project requires **MongoDB** for user accounts and data persistence.
- **Recommended**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free Tier).
- Once you have a cluster, get your **Connection String** (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/portfolio`).
- Add this string to your `backend/.env` as `MONGODB_URI`.

## 2. Environment Variables (`backend/.env`)
Ensure your `.env` file contains these essential keys:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_very_long_random_string_for_security

# For Email Contact Form
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# For Music Player
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
SPOTIFY_PLAYLIST_ID=your_playlist_id
```

## 3. Backend Dependencies
Run this in the `backend` directory to ensure all tools are installed:
```bash
npm install express mongoose jsonwebtoken bcryptjs cors dotenv nodemailer express-rate-limit
```

## 4. Frontend Requirements
Run this in the `client` directory:
```bash
npm install react-router-dom sonner lucide-react animejs
```

## 5. Running the Project
1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd client && npm run dev`

> [!IMPORTANT]
> The "Sign In" and "Login" features **require a working MongoDB connection**. Without it, you will see "Bad Request" errors when trying to register or log in.
