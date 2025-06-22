# Art Inventory - Development Notes

## Project Overview
A web-based art inventory tool for artists using SvelteKit, designed for managing artwork collections with image uploads and metadata.

## Image Storage Strategy

### Current Implementation: Vercel Blob + KV Storage
- **Status:** Complete Vercel ecosystem integration
- **Blob Storage:** Images stored in Vercel Blob (5GB storage, 100GB bandwidth)
- **Database:** Artwork metadata stored in Vercel KV (Redis-compatible)
- **Benefits:** Native Vercel integration, cross-browser persistence, no localStorage dependency

### Future Migration: Cloudinary
- **Plan:** Migrate to Cloudinary later for advanced image features
- **Benefits:** Image optimization, transformations, CDN, art-focused features
- **Timeline:** After initial deployment and testing with Vercel Blob

## Architecture Decisions

### Data Storage
- **Production:** Vercel KV database for artwork metadata + Vercel Blob for images
- **Cross-platform:** Complete cross-browser and cross-device synchronization
- **No localStorage:** All data persists in Vercel infrastructure

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
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Vercel KV Database
KV_URL=your_kv_url_here
KV_REST_API_URL=your_kv_rest_api_url_here
KV_REST_API_TOKEN=your_kv_rest_api_token_here
KV_REST_API_READ_ONLY_TOKEN=your_kv_readonly_token_here
```

**Setup Instructions:**
1. **Vercel Blob:** Create a Blob store in Vercel dashboard → Copy read/write token
2. **Vercel KV:** Create a KV database in Vercel dashboard → Copy all connection details
3. Add all environment variables to your Vercel project settings
4. For local development, create `.env.local` with all tokens

## Notes
- Remove artist field (single artist use)
- No provenance or depth fields needed
- EUR as default currency
- Colored status dots for visual indicators
- Toast notifications positioned bottom-center