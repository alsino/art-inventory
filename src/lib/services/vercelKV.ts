import { kv } from '@vercel/kv';
import type { ArtPiece } from '$lib/types/ArtPiece.js';

const ART_PIECES_KEY = 'art-pieces';
const ART_PIECE_PREFIX = 'art-piece:';

export const vercelKVService = {
	/**
	 * Get all artwork pieces
	 */
	async getAllArtworks(): Promise<ArtPiece[]> {
		try {
			const artworkIds: string[] = await kv.lrange(ART_PIECES_KEY, 0, -1);
			
			if (artworkIds.length === 0) {
				return [];
			}

			// Get all artworks in parallel
			const artworks = await Promise.all(
				artworkIds.map(id => kv.get<ArtPiece>(`${ART_PIECE_PREFIX}${id}`))
			);

			// Filter out any null values and return
			return artworks.filter((artwork): artwork is ArtPiece => artwork !== null);
		} catch (error) {
			console.error('Failed to fetch artworks from KV:', error);
			return [];
		}
	},

	/**
	 * Get single artwork by ID
	 */
	async getArtwork(id: string): Promise<ArtPiece | null> {
		try {
			return await kv.get<ArtPiece>(`${ART_PIECE_PREFIX}${id}`);
		} catch (error) {
			console.error('Failed to fetch artwork from KV:', error);
			return null;
		}
	},

	/**
	 * Add new artwork
	 */
	async addArtwork(artwork: Omit<ArtPiece, 'id' | 'created_date' | 'updated_date'>): Promise<ArtPiece> {
		try {
			const newArtwork: ArtPiece = {
				...artwork,
				id: crypto.randomUUID(),
				created_date: new Date().toISOString(),
				updated_date: new Date().toISOString()
			};

			// Store the artwork
			await kv.set(`${ART_PIECE_PREFIX}${newArtwork.id}`, newArtwork);
			
			// Add to the list of artwork IDs (at the beginning for newest first)
			await kv.lpush(ART_PIECES_KEY, newArtwork.id);

			return newArtwork;
		} catch (error) {
			console.error('Failed to add artwork to KV:', error);
			throw new Error('Failed to save artwork');
		}
	},

	/**
	 * Update existing artwork
	 */
	async updateArtwork(id: string, updates: Partial<Omit<ArtPiece, 'id' | 'created_date'>>): Promise<ArtPiece | null> {
		try {
			const existingArtwork = await kv.get<ArtPiece>(`${ART_PIECE_PREFIX}${id}`);
			
			if (!existingArtwork) {
				throw new Error('Artwork not found');
			}

			const updatedArtwork: ArtPiece = {
				...existingArtwork,
				...updates,
				updated_date: new Date().toISOString()
			};

			await kv.set(`${ART_PIECE_PREFIX}${id}`, updatedArtwork);
			
			return updatedArtwork;
		} catch (error) {
			console.error('Failed to update artwork in KV:', error);
			throw new Error('Failed to update artwork');
		}
	},

	/**
	 * Delete artwork
	 */
	async deleteArtwork(id: string): Promise<void> {
		try {
			// Remove from the artwork data
			await kv.del(`${ART_PIECE_PREFIX}${id}`);
			
			// Remove from the list of IDs
			await kv.lrem(ART_PIECES_KEY, 1, id);
		} catch (error) {
			console.error('Failed to delete artwork from KV:', error);
			throw new Error('Failed to delete artwork');
		}
	},

	/**
	 * Check if KV is available (for fallback logic)
	 */
	async isAvailable(): Promise<boolean> {
		try {
			await kv.ping();
			return true;
		} catch (error) {
			console.warn('Vercel KV not available:', error);
			return false;
		}
	}
};