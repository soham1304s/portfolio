# Soham Mondal | Professional Portfolio

A premium, full-stack portfolio website built with React, Node.js, Anime.js, and a Spotify-powered hero player. This project features a sophisticated contact system plus a curated music card backed by Spotify playlist metadata served securely through the backend.

## 🚀 Email & Contact System

The contact section is a robust full-stack implementation that handles inquiries from the frontend to the inbox and local storage.

### 🎨 Frontend (React + Vite)
- **Interactive UI**: Built with a "premium" aesthetic using glassmorphism and subtle micro-animations powered by Anime.js.
- **Dynamic Feedback**: Integrated **Sonner** for professional toast notifications (Loading, Success, and Error states).
- **Success State**: On successful submission, the form gracefully transitions to a dedicated success card with a checkmark animation, providing clear confirmation.
- **Client-side Validation**: Implements real-time validation for name length, email format, and message detail to ensure high-quality inquiries.
- **Spam Protection**: Includes a "Honeypot" field to trap automated bots without affecting real users.

### ⚙️ Backend (Node.js + Express)
- **Email Delivery**: Uses **Nodemailer** to send real-time notifications to the administrator.
- **Rate Limiting**: Protected by `express-rate-limit` to prevent abuse. Each IP is limited to 5 submissions every 15 minutes.
- **Data Persistence**: All submissions are securely logged into a structured JSON file (`backend/data/contact-submissions.json`) as a backup for email notifications.
- **Security**: Features sanitization and normalization of user input to protect against injection and ensure data integrity.
- **Spotify Client Credentials**: Uses Spotify’s server-to-server client-credentials flow so the frontend never exposes the Spotify secret.
- **Playlist Caching**: Caches the Spotify access token and normalized playlist payload to reduce latency and avoid unnecessary Spotify API requests.
- **Curated Player Data**: Exposes `/api/spotify/playlist` so the hero card can show playlist songs, album images, artist names, and a link back to Spotify.

### 🛠️ Configuration
The system requires the following environment variables in `backend/.env`:

```env
PORT=5000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
CONTACT_TO_EMAIL=your-destination@gmail.com

SPOTIFY_CLIENT_ID=your-spotify-app-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-app-client-secret
SPOTIFY_PLAYLIST_ID=your-public-spotify-playlist-id
SPOTIFY_MARKET=IN
SPOTIFY_PLAYLIST_LIMIT=6
```

If the frontend and backend are deployed on different origins, also add this in `client/.env`:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

### 🎵 Spotify Requirements
To enable the playlist-powered music card:

1. Create a Spotify app in the Spotify Developer Dashboard.
2. Copy the app Client ID and Client Secret into `backend/.env`.
3. Choose a public Spotify playlist and copy its playlist ID.
4. Put the Spotify environment variables above into `backend/.env`.
5. Start both servers.

This setup does not require Spotify Premium, user login, or OAuth redirects because it only reads public playlist metadata through the backend.

## 📂 Project Structure

- `/client`: React frontend with Vite, Anime.js, and Lucide icons.
- `/backend`: Express.js server with Nodemailer and rate limiting.

## 🛠️ Development

### Setup Backend
```bash
cd backend
npm install
npm run dev
```

### Setup Frontend
```bash
cd client
npm install
npm run dev
```

### Spotify Playlist Flow
- `GET /api/spotify/playlist`: returns normalized public playlist data for the hero card.

## 🌐 Deployment

### Frontend (Netlify)
1. **Build Settings**:
   - Build Command: `npm run build`
   - Publish directory: `dist`
2. **Environment Variables**:
   - Add `VITE_API_BASE_URL` pointing to your deployed backend URL.
3. **SPA Routing**:
   - A `_redirects` file and `netlify.toml` are already included to handle React Router navigation.

### Backend (Render/Railway)
1. **Environment Variables**:
   - Ensure all variables from `backend/.env` are added to your hosting provider's dashboard.
2. **Root Directory**: Set to `backend` if deploying from a monorepo.

