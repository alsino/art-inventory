// ABOUTME: Generates a professional artist portfolio PDF from artwork data.
// ABOUTME: Creates cover page and one page per artwork with centered image and details.

import type { ArtPiece } from '$lib/types/ArtPiece';

type StatusFilter = ArtPiece['status'] | 'all';

interface PortfolioOptions {
	artistName: string;
	title: string;
	artworks: ArtPiece[];
	statusFilter: StatusFilter;
	onProgress?: (current: number, total: number) => void;
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
	await addCoverPage(doc, options.artistName, options.title, options.statusFilter, pageWidth, pageHeight);

	// Artwork pages
	const total = options.artworks.length;
	for (let i = 0; i < total; i++) {
		doc.addPage();
		await addArtworkPage(doc, options.artworks[i], pageWidth, pageHeight, margin);
		options.onProgress?.(i + 1, total);
	}

	// Page numbers (skip cover)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const totalPages = (doc.internal as any).getNumberOfPages();
	for (let i = 2; i <= totalPages; i++) {
		doc.setPage(i);
		doc.setFontSize(10);
		doc.setTextColor(150);
		doc.text(`${i - 1}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
	}

	// Save
	const date = new Date().toISOString().split('T')[0];
	const artistSlug = options.artistName.toLowerCase().replace(/\s+/g, '-');
	const filterSlug = getFilterSlug(options.statusFilter);
	doc.save(`${artistSlug}-${filterSlug}-${date}.pdf`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addCoverPage(
	doc: any,
	artistName: string,
	title: string,
	statusFilter: StatusFilter,
	pageWidth: number,
	pageHeight: number
): Promise<void> {
	// Load and add background image (smaller resolution for cover)
	try {
		const { dataUrl } = await loadImageAsDataUrl('/img/004.jpeg', 1600);
		doc.addImage(dataUrl, 0, 0, pageWidth, pageHeight);
	} catch (error) {
		console.warn('Could not load cover image:', error);
	}

	// Text block - left aligned, bottom-left corner
	const leftMargin = 20;
	const baseY = pageHeight - 26;

	// Artist name
	doc.setFont('CormorantGaramond', 'normal');
	doc.setFontSize(16);
	doc.setTextColor(0, 0, 0);
	doc.text(artistName, leftMargin, baseY, { align: 'left' });

	// Title + status combined
	doc.setFont('CormorantGaramond', 'italic');
	doc.setFontSize(11);
	const subtitle = getStatusSubtitle(statusFilter);
	doc.text(`${title} – ${subtitle}`, leftMargin, baseY + 6, { align: 'left' });

	// Date
	doc.setFont('CormorantGaramond', 'normal');
	doc.setFontSize(9);
	doc.setTextColor(100, 100, 100);
	const date = new Date();
	const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
	doc.text(monthYear, leftMargin, baseY + 12, { align: 'left' });

}

function getStatusSubtitle(statusFilter: StatusFilter): string {
	switch (statusFilter) {
		case 'all':
			return 'All artworks';
		case 'available':
			return 'Available works';
		case 'sold':
			return 'Sold works';
		case 'on_hold':
			return 'Artworks currently on hold';
		case 'exhibition':
			return 'Artworks currently at exhibitions';
		case 'damaged':
			return 'Damaged works';
		default:
			return '';
	}
}

function getFilterSlug(statusFilter: StatusFilter): string {
	switch (statusFilter) {
		case 'all':
			return 'all-artworks';
		case 'available':
			return 'available-works';
		case 'sold':
			return 'sold-works';
		case 'on_hold':
			return 'on-hold';
		case 'exhibition':
			return 'exhibition';
		case 'damaged':
			return 'damaged';
		default:
			return 'artworks';
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addArtworkPage(
	doc: any,
	artwork: ArtPiece,
	pageWidth: number,
	pageHeight: number,
	margin: number
): Promise<void> {
	// Layout settings
	const textBlockHeight = 45;
	const bottomMargin = 20;
	const gapBelowImage = 20;
	const maxImageWidth = pageWidth - margin * 2;
	const maxImageHeight = pageHeight - margin - textBlockHeight - bottomMargin;
	const imageTop = margin;

	let imageBottom = imageTop; // Default if no image

	// Fetch and add image
	if (artwork.imageUrl) {
		try {
			const { dataUrl, width: imgWidth, height: imgHeight } = await loadImageAsDataUrl(artwork.imageUrl);
			const { width, height } = fitImageDimensions(
				imgWidth,
				imgHeight,
				maxImageWidth,
				maxImageHeight
			);
			const imageX = (pageWidth - width) / 2;
			doc.addImage(dataUrl, imageX, imageTop, width, height);
			imageBottom = imageTop + height;
		} catch (error) {
			console.warn('Could not load image for artwork:', artwork.title, error);
		}
	}

	// Text positioned below the image
	let textY = imageBottom + gapBelowImage;
	doc.setTextColor(0);
	doc.setFontSize(10);

	// Line 1: Title (italic), Year
	doc.setFont('CormorantGaramond', 'italic');
	const title = artwork.title || 'Untitled';
	const year = artwork.year?.toString() || '';
	const titleYearText = year ? `${title}, ${year}` : title;
	doc.text(titleYearText, pageWidth / 2, textY, { align: 'center' });
	textY += 5;

	// Line 2: Medium
	doc.setFont('CormorantGaramond', 'normal');
	if (artwork.medium) {
		doc.text(artwork.medium, pageWidth / 2, textY, { align: 'center' });
	}
	textY += 5;

	// Line 3: Dimensions
	if (artwork.dimensions?.width && artwork.dimensions?.height) {
		const dims = `${artwork.dimensions.width} x ${artwork.dimensions.height}${artwork.dimensions.unit}`;
		doc.text(dims, pageWidth / 2, textY, { align: 'center' });
	}
	textY += 8;

	// Line 4: Price, Location (gray, smaller)
	doc.setTextColor(120);
	doc.setFontSize(9);
	const secondaryParts: string[] = [];
	if (artwork.price && artwork.price > 0) {
		secondaryParts.push(`${artwork.currency || 'EUR'} ${artwork.price.toLocaleString()}`);
	}
	if (artwork.location) {
		secondaryParts.push(artwork.location);
	}
	if (secondaryParts.length > 0) {
		doc.text(secondaryParts.join(' · '), pageWidth / 2, textY, { align: 'center' });
	}
}

function loadImageAsDataUrl(
	url: string,
	maxDimension: number = 1200
): Promise<{ dataUrl: string; width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			try {
				// Scale down large images
				let width = img.width;
				let height = img.height;
				if (width > maxDimension || height > maxDimension) {
					if (width > height) {
						height = Math.round((height / width) * maxDimension);
						width = maxDimension;
					} else {
						width = Math.round((width / height) * maxDimension);
						height = maxDimension;
					}
				}

				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					reject(new Error('Could not get canvas context'));
					return;
				}
				ctx.drawImage(img, 0, 0, width, height);

				// Use PNG for .png files to preserve transparency, JPEG for others
				const isPng = url.toLowerCase().endsWith('.png');
				const dataUrl = isPng
					? canvas.toDataURL('image/png')
					: canvas.toDataURL('image/jpeg', 0.7);
				resolve({ dataUrl, width, height });
			} catch (error) {
				reject(error);
			}
		};
		img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
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

