// ABOUTME: Downloads artwork images and bundles them into a zip file.
// ABOUTME: Supports progress tracking and generates descriptive filenames.

import type { ArtPiece } from '$lib/types/ArtPiece';

type StatusFilter = ArtPiece['status'] | 'all';

interface DownloadOptions {
	artworks: ArtPiece[];
	statusFilter: StatusFilter;
	onProgress?: (current: number, total: number) => void;
}

/**
 * Sanitizes a string for use as a filename.
 * Removes invalid characters and replaces spaces with hyphens.
 */
function sanitizeFilename(title: string): string {
	if (!title || title.trim() === '') {
		return 'untitled';
	}

	return (
		title
			.toLowerCase()
			.trim()
			// Remove characters invalid in filenames
			.replace(/[<>:"/\\|?*]/g, '')
			// Replace spaces and underscores with hyphens
			.replace(/[\s_]+/g, '-')
			// Remove any remaining non-alphanumeric chars except hyphens
			.replace(/[^a-z0-9-]/g, '')
			// Collapse multiple hyphens
			.replace(/-+/g, '-')
			// Remove leading/trailing hyphens
			.replace(/^-+|-+$/g, '')
			// Truncate to 50 characters
			.slice(0, 50) || 'untitled'
	);
}

/**
 * Extracts file extension from a URL, defaulting to 'jpg'.
 */
function getFileExtension(url: string): string {
	try {
		const pathname = new URL(url).pathname;
		const match = pathname.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
		if (match) {
			const ext = match[1].toLowerCase();
			// Only accept common image extensions
			if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(ext)) {
				return ext;
			}
		}
	} catch {
		// URL parsing failed
	}
	return 'jpg';
}

/**
 * Generates a descriptive zip filename based on the status filter.
 */
function generateZipFilename(statusFilter: StatusFilter): string {
	const date = new Date().toISOString().split('T')[0];
	return `artworks-${statusFilter}-${date}.zip`;
}

/**
 * Downloads all artwork images and bundles them into a zip file.
 */
export async function downloadImagesAsZip(options: DownloadOptions): Promise<void> {
	const { artworks, statusFilter, onProgress } = options;

	// Filter to artworks with images
	const artworksWithImages = artworks.filter((a) => a.imageUrl);
	if (artworksWithImages.length === 0) {
		throw new Error('No images to download');
	}

	// Dynamic import to reduce initial bundle size
	const JSZip = (await import('jszip')).default;
	const zip = new JSZip();

	// Track used filenames for deduplication
	const usedFilenames = new Map<string, number>();

	for (let i = 0; i < artworksWithImages.length; i++) {
		const artwork = artworksWithImages[i];

		try {
			// Fetch image as blob
			const response = await fetch(artwork.imageUrl);
			if (!response.ok) {
				console.warn(`Failed to fetch image for "${artwork.title}": ${response.status}`);
				continue;
			}
			const blob = await response.blob();

			// Generate filename with deduplication
			const baseName = sanitizeFilename(artwork.title);
			const extension = getFileExtension(artwork.imageUrl);

			let filename: string;
			const count = usedFilenames.get(baseName) || 0;
			if (count === 0) {
				filename = `${baseName}.${extension}`;
			} else {
				filename = `${baseName}-${count + 1}.${extension}`;
			}
			usedFilenames.set(baseName, count + 1);

			// Add to zip
			zip.file(filename, blob);
		} catch (error) {
			console.warn(`Failed to process image for "${artwork.title}":`, error);
			// Continue with remaining images
		}

		// Report progress
		onProgress?.(i + 1, artworksWithImages.length);
	}

	// Check if any images were added
	if (Object.keys(zip.files).length === 0) {
		throw new Error('Failed to fetch any images');
	}

	// Generate and download zip
	const zipBlob = await zip.generateAsync({ type: 'blob' });
	const url = URL.createObjectURL(zipBlob);

	const link = document.createElement('a');
	link.href = url;
	link.download = generateZipFilename(statusFilter);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}
