import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export interface UploadResult {
    url: string;
    path: string;
}

export async function uploadImage(file: File, artworkId: string): Promise<UploadResult> {
    try {
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${artworkId}_${timestamp}.${fileExtension}`;
        const imagePath = `artworks/${fileName}`;
        
        const imageRef = ref(storage, imagePath);
        const snapshot = await uploadBytes(imageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        
        return {
            url,
            path: imagePath
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
}

export async function deleteImage(imagePath: string): Promise<void> {
    try {
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
    } catch (error) {
        console.error('Error deleting image:', error);
        throw new Error('Failed to delete image');
    }
}