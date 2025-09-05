# DSA Progress Tracker (Next.js + Firebase)

A polished dashboard to track your DSA progress by topic, with streaks, custom targets, problem logs, and optional Firebase sync (Auth + Firestore + Storage).

## Features
- Overall and per-topic progress bars
- Custom targets per topic
- Daily streak tracking
- Problem logging: name, link, optional image upload
- LocalStorage persistence by default
- Google login to sync to Firebase (Firestore for data, Storage for images)

## Quick Start
```bash
npm install
npm run dev
```

## Deploy
Perfect for Vercel. After pushing to GitHub:
- Import into Vercel
- Add your `.env.local` variables under **Project Settings → Environment Variables**
- Redeploy

## Firebase Setup
1. Create a Firebase project → Web App
2. Enable Authentication → Google provider
3. Enable Firestore (in production or test mode)
4. Enable Storage
5. Copy config to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```
6. Set **Storage Security Rules** to require auth (recommended)
7. Set **Firestore Rules** (simple starter):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
8. Storage Rules (starter):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Notes
- If not signed in, images won’t upload (we keep them local).
- This is an MVP; feel free to extend with a Problem Log page, charts, and reminders.
