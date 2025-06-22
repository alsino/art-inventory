import { artPieces } from '$lib/stores/artPieces.js';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const piece = await artPieces.getById(params.id);
	
	if (!piece) {
		throw error(404, 'Art piece not found');
	}
	
	return {
		piece
	};
};