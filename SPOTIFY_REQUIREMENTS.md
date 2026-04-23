# Spotify Playlist Integration Requirements

To get the Music Player section working with live data from Spotify, you need to set up a Spotify Developer Application. This project uses the **Client Credentials Flow**, which means:
1. **No User Login Required**: Visitors to your site don't need to log in to Spotify.
2. **Public Data Only**: It can only fetch public playlists, artist info, and track metadata.

## 1. Create a Spotify App
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
2. Log in with your Spotify account.
3. Click **"Create App"**.
4. Fill in the details:
   - **App name**: e.g., "My Portfolio"
   - **App description**: e.g., "Music player for my developer portfolio"
   - **Redirect URI**: You can use `http://localhost:3000` (it won't be used for this flow, but it's required).
5. Once created, click on **"Settings"** to find your **Client ID** and **Client Secret**.

## 2. Get a Playlist ID
1. Open Spotify (Desktop or Web).
2. Find the public playlist you want to show.
3. Click the three dots (...) -> **Share** -> **Copy link to playlist**.
4. The ID is the long string of characters after `/playlist/` and before the `?`.
   - Example: `https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM3M` -> ID is `37i9dQZF1DXcBWIGoYBM3M`.

## 3. Configure Environment Variables
Copy the keys into your `backend/.env` file:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_PLAYLIST_ID=your_playlist_id_here
```

## Professional Features Included:
- **No Backend? No Problem**: The frontend has a built-in "Professional Fallback" mode. If the backend is not connected or the keys are missing, it will display a beautiful, curated mock playlist so your portfolio always looks perfect.
- **Client Credentials Flow**: Securely handles authentication via your backend to hide your Client Secret.
- **Smart Caching**: The backend caches the Spotify data for 5 minutes to stay within rate limits and keep your site fast.
- **Micro-animations**: Visualizers and hover effects that make the player feel alive.
