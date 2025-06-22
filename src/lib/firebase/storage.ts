import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
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

export function uploadImageWithProgress(
    file: File, 
    artworkId: string, 
    onProgress: (progress: number) => void
): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        try {
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop() || 'jpg';
            const fileName = `${artworkId}_${timestamp}.${fileExtension}`;
            const imagePath = `artworks/${fileName}`;
            
            const imageRef = ref(storage, imagePath);
            const uploadTask = uploadBytesResumable(imageRef, file);
            
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(Math.round(progress));
                },
                (error) => {
                    console.error('Error uploading image:', error);
                    reject(new Error('Failed to upload image'));
                },
                async () => {
                    try {
                        onProgress(100);
                        const url = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve({
                            url,
                            path: imagePath
                        });
                    } catch (error) {
                        console.error('Failed to get download URL:', error);
                        reject(new Error('Failed to get download URL'));
                    }
                }
            );
        } catch (error) {
            console.error('Error starting upload:', error);
            reject(new Error('Failed to start upload'));
        }
    });
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