import type { ArtPiece } from '../types/ArtPiece.js';

export const mockArtPieces: ArtPiece[] = [
	{
		id: '1',
		title: 'Abstract Composition #1',
		artist: 'Marina Rodriguez',
		year: 2023,
		dimensions: {
			width: 120,
			height: 90,
			unit: 'cm'
		},
		medium: 'Oil on Canvas',
		description: 'A vibrant exploration of color and form, this piece represents the intersection of emotion and geometry.',
		imageUrl: 'https://picsum.photos/400/300?random=1',
		status: 'available',
		price: 2500,
		currency: 'USD',
		location: 'Studio A',
		created_date: '2023-01-15T10:00:00Z',
		updated_date: '2023-01-15T10:00:00Z'
	},
	{
		id: '2',
		title: 'Urban Landscape',
		artist: 'James Chen',
		year: 2022,
		dimensions: {
			width: 80,
			height: 60,
			unit: 'cm'
		},
		medium: 'Acrylic on Canvas',
		description: 'A contemporary take on city life, capturing the energy and movement of modern urban environments.',
		imageUrl: 'https://picsum.photos/400/300?random=2',
		status: 'sold',
		price: 1800,
		currency: 'USD',
		location: 'Sold - Private Collection',
		created_date: '2022-11-20T14:30:00Z',
		updated_date: '2023-03-10T09:15:00Z'
	},
	{
		id: '3',
		title: 'Serenity',
		artist: 'Elena Vasquez',
		year: 2023,
		dimensions: {
			width: 100,
			height: 70,
			unit: 'cm'
		},
		medium: 'Watercolor on Paper',
		description: 'A peaceful meditation on nature and tranquility, executed in delicate watercolor techniques.',
		imageUrl: 'https://picsum.photos/400/300?random=3',
		status: 'exhibition',
		price: 1200,
		currency: 'USD',
		location: 'Gallery Downtown - Spring Exhibition',
		created_date: '2023-02-08T16:45:00Z',
		updated_date: '2023-04-01T11:20:00Z'
	},
	{
		id: '4',
		title: 'Fragments of Memory',
		artist: 'David Thompson',
		year: 2021,
		dimensions: {
			width: 150,
			height: 120,
			unit: 'cm'
		},
		medium: 'Mixed Media',
		description: 'An introspective piece combining various materials to explore themes of memory and time.',
		imageUrl: 'https://picsum.photos/400/300?random=4',
		status: 'available',
		price: 3200,
		currency: 'USD',
		location: 'Studio B',
		created_date: '2021-09-12T13:20:00Z',
		updated_date: '2021-09-12T13:20:00Z'
	},
	{
		id: '5',
		title: 'Digital Dreams',
		artist: 'Sarah Kim',
		year: 2023,
		dimensions: {
			width: 60,
			height: 80,
			unit: 'cm'
		},
		medium: 'Digital Print on Canvas',
		description: 'A modern exploration of digital art techniques printed on traditional canvas.',
		imageUrl: 'https://picsum.photos/400/300?random=5',
		status: 'on_hold',
		price: 950,
		currency: 'USD',
		location: 'Studio A',
		created_date: '2023-06-03T08:15:00Z',
		updated_date: '2023-07-20T14:40:00Z'
	},
	{
		id: '6',
		title: 'The Journey Within',
		artist: 'Michael Roberts',
		year: 2022,
		dimensions: {
			width: 90,
			height: 120,
			unit: 'cm'
		},
		medium: 'Oil on Linen',
		description: 'A contemplative portrait series exploring inner landscapes and personal transformation.',
		imageUrl: 'https://picsum.photos/400/300?random=6',
		status: 'available',
		price: 2800,
		currency: 'USD',
		location: 'Studio C',
		created_date: '2022-08-14T10:30:00Z',
		updated_date: '2022-08-14T10:30:00Z'
	}
];