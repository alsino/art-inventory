import { writable } from 'svelte/store';
import type { ArtPiece } from '$lib/types/ArtPiece.js';
import { addArtwork, updateArtwork, deleteArtwork, getArtwork, getAllArtworks, batchUpdateSortOrders } from '$lib/firebase/firestore.js';
import { deleteImage } from '$lib/firebase/storage.js';
import { browser } from '$app/environment';

function createArtPiecesStore() {
	const { subscribe, set, update } = writable<ArtPiece[]>([]);
	
	// Load data on initialization
	if (browser) {
		loadArtPieces();
	}

	async function loadArtPieces() {
		try {
			const artworks = await getAllArtworks();
			set(artworks);
		} catch (error) {
			console.error('Failed to load artworks:', error);
			set([]);
		}
	}

	return {
		subscribe,
		// Refresh data from Firestore
		refresh: loadArtPieces,
		
		// Add new artwork
		add: async (piece: Omit<ArtPiece, 'id' | 'createdAt' | 'updatedAt'>) => {
			try {
				const artworkId = await addArtwork(piece);
				const newPiece = await getArtwork(artworkId);
				
				if (newPiece) {
					// Add to the beginning of the array (newest first)
					update(pieces => [newPiece, ...pieces]);
				}
				return newPiece;
			} catch (error) {
				console.error('Failed to add artwork:', error);
				throw error;
			}
		},

		// Update existing artwork
		updatePiece: async (id: string, updatedPiece: Partial<Omit<ArtPiece, 'id' | 'createdAt'>>) => {
			try {
				await updateArtwork(id, updatedPiece);
				const updated = await getArtwork(id);
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
				// Get artwork to access image path for deletion
				const artwork = await getArtwork(id);
				
				// Delete artwork from Firestore
				await deleteArtwork(id);
				
				// Delete image from Firebase Storage if it exists
				if (artwork?.imagePath) {
					try {
						await deleteImage(artwork.imagePath);
					} catch (imageError) {
						console.warn('Failed to delete image:', imageError);
					}
				}
				
				update(pieces => pieces.filter(piece => piece.id !== id));
			} catch (error) {
				console.error('Failed to remove artwork:', error);
				throw error;
			}
		},

		// Get artwork by ID (from Firestore, not local store)
		getById: async (id: string): Promise<ArtPiece | null> => {
			try {
				return await getArtwork(id);
			} catch (error) {
				console.error('Failed to get artwork:', error);
				return null;
			}
		},

		// Update sort orders for multiple artworks
		updateSortOrders: async (orderedPieces: ArtPiece[]) => {
			try {
				// Only update pieces whose sortOrder actually changed
				const updates: { id: string; sortOrder: number }[] = [];
				orderedPieces.forEach((piece, index) => {
					if (piece.sortOrder !== index) {
						updates.push({ id: piece.id, sortOrder: index });
					}
				});

				if (updates.length === 0) return;

				// Single batch write to Firebase
				await batchUpdateSortOrders(updates);

				// Update local store
				update(pieces =>
					pieces.map(piece => {
						const newIndex = orderedPieces.findIndex(p => p.id === piece.id);
						if (newIndex !== -1) {
							return { ...piece, sortOrder: newIndex };
						}
						return piece;
					})
				);
			} catch (error) {
				console.error('Failed to update sort orders:', error);
				throw error;
			}
		}
	};
}

export const artPieces = createArtPiecesStore();