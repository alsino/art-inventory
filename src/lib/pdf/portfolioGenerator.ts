// ABOUTME: Generates a professional artist portfolio PDF from artwork data.
// ABOUTME: Creates cover page and one page per artwork with centered image and details.

import type { ArtPiece } from '$lib/types/ArtPiece';

interface PortfolioOptions {
	artistName: string;
	title: string;
	artworks: ArtPiece[];
}

export async function generatePortfolioPDF(options: PortfolioOptions): Promise<void> {
	const { jsPDF } = await import('jspdf');
	const { registerCormorantGaramond } = await import('./fonts/cormorantGaramond');

	const doc = new jsPDF({
		orientation: 'portrait',
		unit: 'mm',
		format: 'a4'
	});

	registerCormorantGaramond(doc);
	doc.setFont('CormorantGaramond');

	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const margin = 20;

	// Cover page
	addCoverPage(doc, options.artistName, options.title, pageWidth, pageHeight);

	// Artwork pages
	for (let i = 0; i < options.artworks.length; i++) {
		doc.addPage();
		await addArtworkPage(doc, options.artworks[i], pageWidth, pageHeight, margin);
	}

	// Page numbers (skip cover)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const totalPages = (doc.internal as any).getNumberOfPages();
	for (let i = 2; i <= totalPages; i++) {
		doc.setPage(i);
		doc.setFontSize(10);
		doc.setTextColor(150);
		doc.text(`${i - 1}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
	}

	// Save
	const date = new Date().toISOString().split('T')[0];
	doc.save(`dossier-${date}.pdf`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addCoverPage(
	doc: any,
	artistName: string,
	title: string,
	pageWidth: number,
	pageHeight: number
): void {
	const centerY = pageHeight / 2;

	// Artist name
	doc.setFontSize(28);
	doc.setTextColor(0);
	doc.text(artistName, pageWidth / 2, centerY - 10, { align: 'center' });

	// Title
	doc.setFontSize(18);
	doc.text(title, pageWidth / 2, centerY + 5, { align: 'center' });

	// Year
	doc.setFontSize(14);
	doc.setTextColor(100);
	doc.text(new Date().getFullYear().toString(), pageWidth / 2, centerY + 20, { align: 'center' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addArtworkPage(
	doc: any,
	artwork: ArtPiece,
	pageWidth: number,
	pageHeight: number,
	margin: number
): Promise<void> {
	const maxImageWidth = pageWidth - margin * 2;
	const maxImageHeight = pageHeight * 0.6;
	const imageTop = margin + 10;

	// Fetch and add image
	let imageBottom = imageTop;
	if (artwork.imageUrl) {
		try {
			const img = await loadImage(artwork.imageUrl);
			const { width, height } = fitImageDimensions(
				img.width,
				img.height,
				maxImageWidth,
				maxImageHeight
			);
			const imageX = (pageWidth - width) / 2;
			doc.addImage(img, 'JPEG', imageX, imageTop, width, height);
			imageBottom = imageTop + height;
		} catch (error) {
			console.warn('Could not load image for artwork:', artwork.title, error);
			imageBottom = imageTop + 50;
		}
	}

	// Text content below image
	let textY = imageBottom + 20;
	doc.setTextColor(0);

	// Title
	doc.setFontSize(16);
	doc.text(artwork.title || 'Untitled', pageWidth / 2, textY, { align: 'center' });
	textY += 7;

	// Year
	doc.setFontSize(12);
	doc.text(artwork.year?.toString() || '', pageWidth / 2, textY, { align: 'center' });
	textY += 12;

	// Dimensions
	if (artwork.dimensions?.width && artwork.dimensions?.height) {
		const dims = `${artwork.dimensions.width} × ${artwork.dimensions.height} ${artwork.dimensions.unit}`;
		doc.text(dims, pageWidth / 2, textY, { align: 'center' });
		textY += 6;
	}

	// Medium
	if (artwork.medium) {
		doc.text(artwork.medium, pageWidth / 2, textY, { align: 'center' });
		textY += 12;
	}

	// Secondary info (gray)
	doc.setTextColor(100);
	doc.setFontSize(11);

	// Price
	if (artwork.price && artwork.price > 0) {
		const price = `${artwork.currency || 'EUR'} ${artwork.price.toLocaleString()}`;
		doc.text(price, pageWidth / 2, textY, { align: 'center' });
		textY += 6;
	}

	// Status
	const statusDisplay = formatStatus(artwork.status);
	doc.text(statusDisplay, pageWidth / 2, textY, { align: 'center' });
	textY += 6;

	// Location
	if (artwork.location) {
		doc.text(artwork.location, pageWidth / 2, textY, { align: 'center' });
	}
}

function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = url;
	});
}

function fitImageDimensions(
	imgWidth: number,
	imgHeight: number,
	maxWidth: number,
	maxHeight: number
): { width: number; height: number } {
	const aspectRatio = imgWidth / imgHeight;

	let width = maxWidth;
	let height = width / aspectRatio;

	if (height > maxHeight) {
		height = maxHeight;
		width = height * aspectRatio;
	}

	return { width, height };
}

function formatStatus(status: ArtPiece['status']): string {
	const statusMap: Record<ArtPiece['status'], string> = {
		available: 'Available',
		sold: 'Sold',
		on_hold: 'On Hold',
		exhibition: 'Exhibition',
		damaged: 'Damaged'
	};
	return statusMap[status] || status;
}
