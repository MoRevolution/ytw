import { getAdminDB } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const adminDb = getAdminDB();
    const { uid, email, displayName, accessToken, photoURL } = await request.json();

    // First check if users collection exists and if this user exists
    const usersRef = adminDb.collection('users');
    const userDoc = await usersRef.doc(uid).get();
    const now = new Date();

    if (!userDoc.exists) {
      // User doesn't exist, create new user document
      await usersRef.doc(uid).set({
        uid,
        email,
        displayName,
        photoURL,
        accessToken,
        createdAt: now,
        lastLogin: now,
        hasWatchHistory: false
      });
      return NextResponse.json({ success: true, isNewUser: true });
    }

    // Update existing user's last login
    await usersRef.doc(uid).update({
      lastLogin: now,
      accessToken, // Update token
      email,
      displayName,
      photoURL,
    });

    return NextResponse.json({ 
      success: true, 
      isNewUser: false,
      hasWatchHistory: userDoc.data()?.hasWatchHistory || false 
    });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Failed to create/update user' }, { status: 500 });
  }
} 