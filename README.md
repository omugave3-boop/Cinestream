# 馃幀 CineStream - Movie Streaming Platform

A modern movie streaming platform with user authentication, admin panel, Google Ads integration, and more.

## Features

- 馃攼 **User Authentication** 鈥� Login, Register, Admin Login
- 馃帴 **Movie Streaming** 鈥� Watch movies with a built-in video player
- 馃搨 **Categories** 鈥� Trending, Top Rated, New Releases, Featured, Genre filters
- 馃搵 **Watchlist** 鈥� Bookmark movies for later
- 猸� **User Ratings** 鈥� Rate movies on a 10-star scale
- 馃洝锔� **Admin Panel** 鈥� Full CRUD (Add, Edit, Delete movies), dashboard stats
- 馃挵 **Google Ads** 鈥? Ad placement zones throughout the platform
- 馃摫 **Responsive** 鈥? Works on desktop, tablet, and mobile
- **v1.0.1** 鈥? Admin login fix & Upload widget (Mar 25, 2026)

## Two Separate Views

| View | URL |
|------|-----|
| **User/Browse** | `yourdomain.com/#user` |
| **Admin Panel** | `yourdomain.com/#admin` |

## Default Admin Credentials

- **Email:** `admin@cinestream.com`
- **Password:** `admin123`

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy to Vercel (Recommended - Free)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/cinestream.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "New Project" 鈫? Import your `cinestream` repository
   - Vercel auto-detects Vite 鈥? just click **Deploy**
   - Your site will be live at `https://cinestream-xxx.vercel.app`

## Deploy to Netlify (Alternative - Free)

1. Push to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com) 鈫? "Add new site" 鈫? "Import an existing project"
3. Connect your GitHub repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Click **Deploy**

## Deploy via Drag & Drop (Netlify)

1. Run `npm run build` locally
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder into the browser
4. Your site is live instantly!

## Google AdSense Setup

1. Sign up at [adsense.google.com](https://adsense.google.com)
2. Get your Publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`)
3. In `index.html`, uncomment the AdSense script tag and add your Publisher ID
4. In `src/components/AdBanner.tsx`, replace the placeholder content with your ad unit code:
   ```tsx
   <ins className="adsbygoogle"
     style={{display:"block"}}
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true">
   </ins>
   ```
5. Call `(window.adsbygoogle = window.adsbygoogle || []).push({})` in a `useEffect`

## Tech Stack

- **React 18** + TypeScript
- **Vite** 鈥? Build tool
- **Tailwind CSS** + **DaisyUI** 鈥? Styling
- **Lucide React** 鈥? Icons
- **localStorage** 鈥? Data persistence (no backend needed)

## Custom Domain

After deploying to Vercel or Netlify, you can add a custom domain:

- Vercel: Settings 鈫? Domains 鈫? Add your domain
- Netlify: Site settings 鈫? Domain management 鈫? Add custom domain

## Data Storage

This version uses **localStorage** for data persistence. Data persists in the user's browser. For a production app with shared data across users, consider:

- **Firebase** (Firestore + Auth)
- **Supabase** (PostgreSQL + Auth)
- **Your own Node.js/Express API**

---

Built with 鉂わ笍 for movie lovers