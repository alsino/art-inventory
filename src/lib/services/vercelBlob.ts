import { put, del } from '@vercel/blob';
import { browser } from '$app/environment';

export interface BlobUploadResult {
	url: string;
	pathname: string;
}

export const vercelBlobService = {
	/**
	 * Upload an image file to Vercel Blob storage
	 */
	async uploadImage(file: File): Promise<BlobUploadResult> {
		if (!browser) {
			throw new Error('Image upload only available in browser environment');
		}

		try {
			// Generate a unique filename with timestamp
			const timestamp = Date.now();
			const extension = file.name.split('.').pop() || 'jpg';
			const filename = `artwork-${timestamp}.${extension}`;

			// Upload to Vercel Blob
			const blob = await put(filename, file, {
				access: 'public',
				addRandomSuffix: true, // Adds random suffix to prevent collisions
			});

			return {
				url: blob.url,
				pathname: blob.pathname,
			};
		} catch (error) {
			console.error('Failed to upload image to Vercel Blob:', error);
			throw new Error('Failed to upload image. Please try again.');
		}
	},

	/**
	 * Delete an image from Vercel Blob storage
	 */
	async deleteImage(url: string): Promise<void> {
		if (!browser) {
			throw new Error('Image deletion only available in browser environment');
		}

		try {
			await del(url);
		} catch (error) {
			console.error('Failed to delete image from Vercel Blob:', error);
			// Don't throw here as the image might already be deleted
			// or the URL might be invalid
		}
	},

	/**
	 * Check if a URL is a Vercel Blob URL
	 */
	isBlobUrl(url: string): boolean {
		return url.includes('blob.vercel-storage.com') || url.includes('vercel-storage.com');
	},

	/**
	 * Fallback: Convert file to base64 for local development/fallback
	 */
	async convertToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	},
};