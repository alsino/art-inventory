export interface ArtPiece {
	id: string;
	title: string;
	artist: string;
	year: number;
	dimensions: {
		width: number;
		height: number;
		depth?: number;
		unit: 'cm' | 'in' | 'mm';
	};
	medium: string;
	description?: string;
	imageUrl: string;
	status: 'available' | 'sold' | 'on_hold' | 'exhibition' | 'damaged';
	price?: number;
	currency?: string;
	location?: string;
	provenance?: string;
	created_date: string;
	updated_date: string;
}

export type ArtPieceStatus = ArtPiece['status'];