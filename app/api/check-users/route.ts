import { checkUsersCollection } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const exists = await checkUsersCollection();
    return NextResponse.json({ exists });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check users collection' }, { status: 500 });
  }
} 