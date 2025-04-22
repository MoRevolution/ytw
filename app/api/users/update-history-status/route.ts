import { getAdminDB } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const adminDb = getAdminDB();
    const { uid, hasWatchHistory } = await request.json();

    await adminDb.collection('users').doc(uid).update({
      hasWatchHistory,
      lastDataUpdate: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating watch history status:', error);
    return NextResponse.json({ error: 'Failed to update watch history status' }, { status: 500 });
  }
} 