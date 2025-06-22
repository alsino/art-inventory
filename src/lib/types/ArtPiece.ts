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
	imagePath?: string;
	status: 'available' | 'sold' | 'on_hold' | 'exhibition' | 'damaged';
	price?: number;
	currency?: string;
	location?: string;
	provenance?: string;
	createdAt: Date;
	updatedAt: Date;
}

export type ArtPieceStatus = ArtPiece['status'];