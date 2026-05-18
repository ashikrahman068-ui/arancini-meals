# Arancini Meals — PWA Setup Guide

This app is now configured as a **Progressive Web App (PWA)** — a single React codebase that works as:
- ✅ A full website at arancinimeals.com
- ✅ An installable app on iPhone (via Safari "Add to Home Screen")
- ✅ An installable app on Android (via Chrome install prompt)
- ✅ Optionally publishable to App Store / Play Store via PWABuilder

---

## What Was Added

### 1. `/public/manifest.json`
The Web App Manifest — tells browsers and phones how to install your app:
- App name, short name, description
- Theme colour (green `#16a34a`)
- Display mode: `standalone` (feels like a native app, no browser chrome)
- App shortcuts (Meals, Subscription, Planner — appear on long-press of icon)
- Icons (see icon generation below)

### 2. `index.html` (updated)
Full set of PWA meta tags:
- Apple mobile web app meta tags (iOS install support)
- Open Graph + Twitter card meta
- Theme colour, favicon references
- `viewport-fit=cover` for iPhone notch support

### 3. `vite.config.js` (updated)
Added `vite-plugin-pwa` with Workbox caching:
- **App shell** (JS/CSS/HTML): CacheFirst — instant loads
- **Meal images** (Supabase): StaleWhileRevalidate — shows cached, updates in background
- **API calls**: NetworkFirst — always tries fresh data, falls back to cache
- Auto-update: new service worker activates immediately

### 4. `src/components/pwa/PWAInstallBanner.jsx` (new)
Smart install prompt:
- **Android/Chrome**: Shows native 1-tap install button
- **iOS/Safari**: Shows "Share → Add to Home Screen" instructions
- Appears 3 seconds after load, dismissed with ✕

### 5. `src/components/pwa/PWAUpdateBanner.jsx` (new)
Update notification bar:
- When you deploy a new version, a green banner appears: "Menu updated! Refresh for the latest meals."
- Important for weekly menu changes

---

## Setup Steps

### Step 1 — Install the new dependency
```bash
npm install
```
This installs `vite-plugin-pwa` and `workbox-window`.

### Step 2 — Generate PWA Icons
You need your logo as PNG icons in `/public/icons/`. Use one of these free tools:

**Option A — PWABuilder (recommended)**
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your logo (from Supabase URL or download it first)
3. Download the icon pack
4. Place all `.png` files into `/public/icons/`

**Option B — Favicon.io**
1. Go to https://favicon.io/favicon-converter/
2. Upload your logo
3. Download and extract into `/public/icons/`

Required icon sizes (rename to match):
```
/public/icons/
  icon-72x72.png
  icon-96x96.png
  icon-128x128.png
  icon-144x144.png
  icon-152x152.png
  icon-192x192.png    ← most important (Android home screen)
  icon-384x384.png
  icon-512x512.png    ← most important (splash screen)
```

### Step 3 — Test locally
```bash
npm run dev
```
Open Chrome DevTools → Application tab → Manifest (check it loads)
Open Chrome DevTools → Application tab → Service Workers (check it registers)

### Step 4 — Build and test PWA score
```bash
npm run build
npm run preview
```
Then open Chrome DevTools → Lighthouse → check "Progressive Web App"
Target score: 90+

### Step 5 — Deploy
Deploy to your hosting (Vercel, Netlify, etc.). **HTTPS is required** for PWA features.

---

## Testing on iPhone
1. Open Safari on iPhone → go to your deployed URL
2. Tap the Share button (⬆)
3. Scroll down → "Add to Home Screen"
4. Tap Add
5. The app appears on home screen, opens in full-screen (no Safari bar)

## Testing on Android
1. Open Chrome on Android → go to your deployed URL
2. The install banner appears automatically (or tap ⋮ menu → "Add to Home Screen")
3. The app installs like a native app

---

## Optional: Publish to App Store / Play Store

Once your PWA is live and scoring 90+ on Lighthouse:

1. Go to https://www.pwabuilder.com
2. Enter your URL: `https://arancinimeals.com`
3. Click "Package for stores"
4. Download the Android (`.aab`) or iOS (`.ipa`) package
5. Submit to Google Play Console or Apple App Store Connect

This wraps your PWA in a thin native shell — no React Native required.

---

## File Structure Added
```
arancini-meals/
├── public/
│   ├── manifest.json          ← NEW: PWA manifest
│   └── icons/                 ← NEW: Add your icons here
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       ├── icon-128x128.png
│       ├── icon-144x144.png
│       ├── icon-152x152.png
│       ├── icon-192x192.png
│       ├── icon-384x384.png
│       └── icon-512x512.png
├── src/
│   └── components/
│       └── pwa/
│           ├── PWAInstallBanner.jsx   ← NEW: Install prompt
│           └── PWAUpdateBanner.jsx    ← NEW: Update notification
├── index.html                 ← UPDATED: PWA meta tags
├── vite.config.js             ← UPDATED: vite-plugin-pwa
└── package.json               ← UPDATED: new dependencies
```
