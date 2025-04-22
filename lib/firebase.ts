// Regular Firebase initialization for client-side
import { initializeApp as initializeClientApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize client app
const clientApp = initializeClientApp(clientConfig);
export const auth = getAuth(clientApp);
export const db = getFirestore(clientApp);

// // Initialize admin SDK (only on server-side)
// if (typeof window === 'undefined' && !getAdminApps().length) {
//   console.log('Initializing Firebase Admin SDK...');
//   try {
//     initializeAdminApp({
//       credential: cert({
//         projectId: process.env.FIREBASE_PROJECT_ID,
//         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//         privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//       }),
//     });
//     console.log('Firebase Admin SDK initialized successfully');
    
//     // Test the admin DB connection
//     const adminDb = getAdminFirestore();
//     const testQuery = adminDb.collection('users').limit(1);
//     testQuery.get().then(() => {
//       console.log('Successfully connected to Firestore with admin privileges');
//     }).catch((error) => {
//       console.error('Error connecting to Firestore:', error);
//     });
//   } catch (error) {
//     console.error('Error initializing Firebase Admin:', error);
//     console.log('Environment variables:', {
//       projectId: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set',
//       privateKey: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not set',
//     });
//   }
// } else {
//   console.log('Skipping Admin SDK initialization (client-side or already initialized)');
// }

// // Uncomment and export the admin functionality
// export const adminDb = typeof window === 'undefined' ? getAdminFirestore() : null;

// export async function checkUsersCollection() {
//   if (!adminDb) {
//     throw new Error('Admin DB is not available on client-side');
//   }
  
//   try {
//     const usersRef = adminDb.collection('users');
//     const snapshot = await usersRef.limit(1).get();
//     console.log('Users collection exists:', !snapshot.empty);
//     return !snapshot.empty;
//   } catch (error) {
//     console.error("Error checking users collection:", error);
//     throw error;
//   }
// }