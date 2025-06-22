import { writable } from 'svelte/store';
import type { ArtPiece } from '$lib/types/ArtPiece.js';
import { mockArtPieces } from '$lib/data/mockData.js';
import { browser } from '$app/environment';

const STORAGE_KEY = 'art-inventory-pieces';

// Load data from localStorage or use mock data as fallback
function loadArtPieces(): ArtPiece[] {
	if (!browser) return mockArtPieces;
	
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			// If we have stored data, use it; otherwise use mock data
			return parsed.length > 0 ? parsed : mockArtPieces;
		}
	} catch (error) {
		console.warn('Failed to load art pieces from localStorage:', error);
	}
	
	return mockArtPieces;
}

// Save data to localStorage
function saveArtPieces(pieces: ArtPiece[]) {
	if (!browser) return;
	
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(pieces));
	} catch (error) {
		console.warn('Failed to save art pieces to localStorage:', error);
	}
}

function createArtPiecesStore() {
	const initialData = loadArtPieces();
	const { subscribe, set, update } = writable<ArtPiece[]>(initialData);

	return {
		subscribe,
		set: (pieces: ArtPiece[]) => {
			set(pieces);
			saveArtPieces(pieces);
		},
		add: (piece: Omit<ArtPiece, 'id' | 'created_date' | 'updated_date'>) => {
			const newPiece: ArtPiece = {
				...piece,
				id: crypto.randomUUID(),
				created_date: new Date().toISOString(),
				updated_date: new Date().toISOString()
			};
			update(pieces => {
				const updated = [...pieces, newPiece];
				saveArtPieces(updated);
				return updated;
			});
			return newPiece;
		},
		updatePiece: (id: string, updatedPiece: Partial<Omit<ArtPiece, 'id' | 'created_date'>>) => {
			update(pieces => {
				const updated = pieces.map(piece => 
					piece.id === id 
						? { ...piece, ...updatedPiece, updated_date: new Date().toISOString() }
						: piece
				);
				saveArtPieces(updated);
				return updated;
			});
		},
		remove: (id: string) => {
			update(pieces => {
				const updated = pieces.filter(piece => piece.id !== id);
				saveArtPieces(updated);
				return updated;
			});
		},
		getById: (id: string) => {
			let result: ArtPiece | undefined;
			subscribe(pieces => {
				result = pieces.find(piece => piece.id === id);
			})();
			return result;
		}
	};
}

export const artPieces = createArtPiecesStore();