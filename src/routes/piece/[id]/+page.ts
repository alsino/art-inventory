import { artPieces } from '$lib/stores/artPieces.js';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';

export const load: PageLoad = ({ params }) => {
	const pieces = get(artPieces);
	const piece = pieces.find(p => p.id === params.id);
	
	if (!piece) {
		throw error(404, 'Art piece not found');
	}
	
	return {
		piece
	};
};