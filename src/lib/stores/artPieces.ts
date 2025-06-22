import { writable } from 'svelte/store';
import type { ArtPiece } from '$lib/types/ArtPiece.js';
import { vercelKVService } from '$lib/services/vercelKV.js';
import { browser } from '$app/environment';

function createArtPiecesStore() {
	const { subscribe, set, update } = writable<ArtPiece[]>([]);
	
	// Load data on initialization
	if (browser) {
		loadArtPieces();
	}

	async function loadArtPieces() {
		try {
			const artworks = await vercelKVService.getAllArtworks();
			// Sort by creation date, newest first
			const sorted = artworks.sort((a, b) => 
				new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
			);
			set(sorted);
		} catch (error) {
			console.error('Failed to load artworks:', error);
			set([]);
		}
	}

	return {
		subscribe,
		// Refresh data from KV
		refresh: loadArtPieces,
		
		// Add new artwork
		add: async (piece: Omit<ArtPiece, 'id' | 'created_date' | 'updated_date'>) => {
			try {
				const newPiece = await vercelKVService.addArtwork(piece);
				// Add to the beginning of the array (newest first)
				update(pieces => [newPiece, ...pieces]);
				return newPiece;
			} catch (error) {
				console.error('Failed to add artwork:', error);
				throw error;
			}
		},

		// Update existing artwork
		updatePiece: async (id: string, updatedPiece: Partial<Omit<ArtPiece, 'id' | 'created_date'>>) => {
			try {
				const updated = await vercelKVService.updateArtwork(id, updatedPiece);
				if (updated) {
					update(pieces => 
						pieces.map(piece => piece.id === id ? updated : piece)
					);
				}
				return updated;
			} catch (error) {
				console.error('Failed to update artwork:', error);
				throw error;
			}
		},

		// Remove artwork
		remove: async (id: string) => {
			try {
				await vercelKVService.deleteArtwork(id);
				update(pieces => pieces.filter(piece => piece.id !== id));
			} catch (error) {
				console.error('Failed to remove artwork:', error);
				throw error;
			}
		},

		// Get artwork by ID (from KV, not local store)
		getById: async (id: string): Promise<ArtPiece | null> => {
			try {
				return await vercelKVService.getArtwork(id);
			} catch (error) {
				console.error('Failed to get artwork:', error);
				return null;
			}
		}
	};
}

export const artPieces = createArtPiecesStore();