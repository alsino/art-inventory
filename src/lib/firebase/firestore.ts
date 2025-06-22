import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    getDoc, 
    query, 
    orderBy, 
    serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import type { ArtPiece } from '$lib/types/ArtPiece';

const COLLECTION_NAME = 'artworks';

export interface FirestoreArtPiece extends Omit<ArtPiece, 'id' | 'createdAt' | 'updatedAt'> {
    createdAt?: any;
    updatedAt?: any;
}

export async function addArtwork(artwork: Omit<ArtPiece, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
        const artworkData: FirestoreArtPiece = {
            ...artwork,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), artworkData);
        return docRef.id;
    } catch (error) {
        console.error('Error adding artwork:', error);
        throw new Error('Failed to add artwork');
    }
}

export async function updateArtwork(id: string, artwork: Partial<ArtPiece>): Promise<void> {
    try {
        const artworkRef = doc(db, COLLECTION_NAME, id);
        const updateData = {
            ...artwork,
            updatedAt: serverTimestamp()
        };
        delete updateData.id;
        delete updateData.createdAt;

        await updateDoc(artworkRef, updateData);
    } catch (error) {
        console.error('Error updating artwork:', error);
        throw new Error('Failed to update artwork');
    }
}

export async function deleteArtwork(id: string): Promise<void> {
    try {
        const artworkRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(artworkRef);
    } catch (error) {
        console.error('Error deleting artwork:', error);
        throw new Error('Failed to delete artwork');
    }
}

export async function getArtwork(id: string): Promise<ArtPiece | null> {
    try {
        const artworkRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(artworkRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data() as FirestoreArtPiece;
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting artwork:', error);
        throw new Error('Failed to get artwork');
    }
}

export async function getAllArtworks(): Promise<ArtPiece[]> {
    try {
        const collectionRef = collection(db, COLLECTION_NAME);
        const querySnapshot = await getDocs(collectionRef);
        
        const artworks = querySnapshot.docs.map(doc => {
            const data = doc.data() as FirestoreArtPiece;
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            };
        });
        
        // Sort manually since orderBy might cause issues with empty collection
        return artworks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
    } catch (error) {
        console.error('Firestore error:', error);
        
        // Return empty array instead of throwing to prevent app crash
        return [];
    }
}