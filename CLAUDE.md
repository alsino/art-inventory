# Art Inventory - Development Notes

## Project Overview
A web-based art inventory tool for artists using SvelteKit, designed for managing artwork collections with image uploads and metadata.

## Image Storage Strategy

### Current Implementation: Vercel Blob Storage
- **Status:** Starting with Vercel Blob for simplicity and Vercel integration
- **Benefits:** Native Vercel integration, generous free tier (5GB storage, 100GB bandwidth)
- **Setup:** Using @vercel/blob package for seamless deployment

### Future Migration: Cloudinary
- **Plan:** Migrate to Cloudinary later for advanced image features
- **Benefits:** Image optimization, transformations, CDN, art-focused features
- **Timeline:** After initial deployment and testing with Vercel Blob

## Architecture Decisions

### Data Storage
- **Local Development:** localStorage for persistence across browser sessions
- **Production:** localStorage + Vercel Blob for images
- **Future:** Consider Supabase or similar for multi-device sync

### Image Handling
- **Current:** Base64 encoding for local storage fallback
- **Vercel Blob:** Direct file uploads to blob storage with URL references
- **Future Cloudinary:** Advanced image processing and optimization

## Tech Stack
- **Frontend:** SvelteKit with TypeScript
- **Styling:** Custom CSS with gallery-inspired minimal design
- **State Management:** Svelte stores with localStorage persistence
- **Image Storage:** Vercel Blob (migrating from base64)
- **Deployment:** Vercel
- **Future Images:** Cloudinary

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
VERCEL_BLOB_READ_WRITE_TOKEN=your_token_here
```

**Setup Instructions:**
1. Create a Vercel Blob store in your Vercel dashboard
2. Copy the read/write token from Storage > Blob
3. Add to your Vercel project environment variables
4. For local development, create `.env.local` with the token

## Notes
- Remove artist field (single artist use)
- No provenance or depth fields needed
- EUR as default currency
- Colored status dots for visual indicators
- Toast notifications positioned bottom-center