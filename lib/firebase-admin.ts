import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export function getAdminDB() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export async function checkUsersCollection() {
  try {
    const adminDb = getAdminDB();
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.limit(1).get();
    console.log('Users collection exists:', !snapshot.empty);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking users collection:", error);
    throw error;
  }
} 