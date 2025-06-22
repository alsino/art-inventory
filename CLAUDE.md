# Art Inventory - Development Notes

## Project Overview
A web-based art inventory tool for artists using SvelteKit, designed for managing artwork collections with image uploads and metadata.

## Image Storage Strategy

### Current Implementation: Firebase (Complete Migration)
- **Status:** Complete Firebase ecosystem integration
- **Firebase Storage:** Images stored in Firebase Storage with automatic scaling
- **Firebase Firestore:** Artwork metadata stored in Firestore NoSQL database
- **Benefits:** Unified Google Cloud infrastructure, real-time updates, cross-platform sync, automatic backup

### Migration History
- **Phase 1:** Started with localStorage (browser-only)
- **Phase 2:** Attempted Vercel Blob + KV integration
- **Phase 3:** Migrated to Firebase for unified solution

## Architecture Decisions

### Data Storage
- **Production:** Firebase Firestore for artwork metadata + Firebase Storage for images
- **Cross-platform:** Complete cross-browser and cross-device synchronization
- **Real-time:** Live updates across all connected clients
- **Scalable:** Google Cloud infrastructure with automatic scaling

### Image Handling
- **Firebase Storage:** Direct file uploads with Firebase SDK
- **Unique naming:** Images stored with artwork ID and timestamp
- **Automatic cleanup:** Images deleted when artwork is removed
- **CDN delivery:** Global content delivery network

## Tech Stack
- **Frontend:** SvelteKit with TypeScript
- **Styling:** Custom CSS with gallery-inspired minimal design
- **State Management:** Svelte stores with Firebase integration
- **Database:** Firebase Firestore (NoSQL)
- **Image Storage:** Firebase Storage
- **Deployment:** Vercel (with Firebase backend)

## Key Features
- Add/edit/view artworks
- Image upload with persistence
- Status tracking (available, sold, on hold, exhibition, damaged)
- Toast notifications for user feedback
- Mobile-responsive gallery layout
- Automatic sorting by creation date

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables
```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
```

**Setup Instructions:**
1. **Firebase Project:** Create a new Firebase project at https://console.firebase.google.com
2. **Firestore Database:** Enable Firestore Database in production mode
3. **Firebase Storage:** Enable Firebase Storage with default rules
4. **Web App:** Register a web app and copy the config values
5. **Environment Variables:** Add all variables to your Vercel project settings
6. **Local Development:** Create `.env.local` with all Firebase config values

**Firebase Security Rules:**
- **Firestore:** Configure rules to allow read/write for your use case
- **Storage:** Configure rules to allow image uploads and deletions

## Notes
- Remove artist field (single artist use)
- No provenance or depth fields needed
- EUR as default currency
- Colored status dots for visual indicators
- Toast notifications positioned bottom-center