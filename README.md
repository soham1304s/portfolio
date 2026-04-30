# Soham Mondal | Professional Portfolio

A premium, full-stack portfolio website built with React, Node.js, Anime.js, and a curated hero audio player. This project features a sophisticated contact system plus a curated music card designed for a professional developer aesthetic.

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

### 🛠️ Configuration
The system requires the following environment variables in `backend/.env`:

```env
PORT=5000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
CONTACT_TO_EMAIL=your-destination@gmail.com
```

If the frontend and backend are deployed on different origins, also add this in `client/.env`:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

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

