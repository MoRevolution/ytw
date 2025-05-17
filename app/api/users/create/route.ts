import { getAdminDB } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { encryptToken } from '@/lib/encryption';

export async function POST(request: Request) {
  try {
    console.log('🔔 Starting user creation/update process');
    const adminDb = getAdminDB();
    const { uid, email, displayName, accessToken, photoURL } = await request.json();
    console.log('📝 User data received:', { uid, email, displayName });

    // Encrypt the access token before storing
    const encryptedToken = await encryptToken(accessToken);

    // First check if users collection exists and if this user exists
    const usersRef = adminDb.collection('users');
    const userDoc = await usersRef.doc(uid).get();
    const now = new Date();

    if (!userDoc.exists) {
      console.log('👤 Creating new user document');
      // User doesn't exist, create new user document
      await usersRef.doc(uid).set({
        uid,
        email,
        displayName,
        photoURL,
        accessToken: encryptedToken,
        createdAt: now,
        lastLogin: now,
        hasWatchHistory: false
      });
      console.log('✅ New user created successfully');
      return NextResponse.json({ success: true, isNewUser: true });
    }

    console.log('🔄 Updating existing user');
    // Update existing user's last login
    await usersRef.doc(uid).update({
      lastLogin: now,
      accessToken: encryptedToken, // Update token
      email,
      displayName,
      photoURL,
    });
    console.log('✅ User updated successfully');

    return NextResponse.json({ 
      success: true, 
      isNewUser: false,
      hasWatchHistory: userDoc.data()?.hasWatchHistory || false 
    });
  } catch (error) {
    console.error('❌ Error in user creation/update:', error);
    return NextResponse.json({ 
      error: 'Failed to create/update user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 