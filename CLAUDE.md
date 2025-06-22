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
- **Phase 3:** Migrated to Firebase for one unified solution

## Architecture Decisions (for now)

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
- **Styling:** Custom CSS with gallery-inspired minimal design (black/white aesthetic)
- **State Management:** Svelte stores with Firebase integration
- **Database:** Firebase Firestore (NoSQL)
- **Image Storage:** Firebase Storage with CORS considerations
- **PDF Generation:** jsPDF library for client-side PDF creation
- **Deployment:** Vercel (with Firebase backend)

## Key Features
- Add/edit/view artworks with comprehensive metadata
- Image upload with Firebase Storage persistence and progress tracking
- Status tracking (available, sold, on hold, exhibition, damaged) with colored indicators
- Status filtering functionality on overview page
- Professional PDF export with sleek design matching web application
- Toast notifications for user feedback (bottom-center positioned)
- Mobile-responsive gallery layout with proper grid behavior
- Automatic sorting by creation date (latest first)
- Delete functionality with confirmation dialogs

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

## PDF Export Feature
- **Library:** jsPDF v3.0.1 for client-side PDF generation
- **Design:** Sleek layout matching web application aesthetic
- **Header:** Includes icon (/icon.png) and "INVENTAR" branding
- **Layout:** 4-column table (Title, Year, Medium, Dimensions)
- **Price Display:** Positioned below title in subtle gray text
- **Filename Format:** `inventar-{status}-artworks-DD-MM-YYYY.pdf`
- **Responsive:** Proper page breaks and pagination
- **Known Limitation:** Image thumbnails disabled due to Firebase Storage CORS restrictions

## Data Structure Notes
- **Removed Fields:** artist, provenance, depth (cleaned up for single-artist use)
- **Required Fields:** title, year, medium, dimensions (width, height, unit)
- **Optional Fields:** description, price, currency, location
- **Status Values:** available, sold, on_hold, exhibition, damaged
- **Default Currency:** EUR
- **Image Storage:** Firebase Storage URLs with cleanup on deletion

## UI/UX Design Principles
- **Aesthetic:** Minimal black/white gallery-inspired design
- **Typography:** Clean, uppercase headers with proper letter spacing
- **Layout:** Left-aligned header, centered filter buttons, responsive grid
- **Interactions:** Hover effects, smooth transitions, status color coding
- **Mobile:** Responsive design with touch-friendly interactions
- **Notifications:** Bottom-center toast positioning without distracting borders

## Known Issues & Considerations
1. **Firebase Storage CORS:** Images cannot be embedded in PDFs due to CORS policy
   - Solution: Configure Firebase Storage CORS rules in production
   - Workaround: PDF export works without thumbnails
2. **Single Artwork Display:** Fixed grid layout prevents stretching when only one item
3. **Mobile Upload:** Resolved environment variable issues in Vercel deployment
4. **Git Security:** Cleaned history after accidental API key exposure

## Future Development Ideas
- Add image thumbnails to PDF when CORS is resolved
- Implement user authentication for multi-artist support
- Add bulk operations (delete, status change)
- Enhanced search and filtering capabilities
- Export to other formats (CSV, Excel)
- Image optimization and compression
- Artwork categorization and tags