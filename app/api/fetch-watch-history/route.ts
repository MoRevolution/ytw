import { fetchAndExtractZip } from '@/lib/google-drive-backend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    const watchHistoryData = await fetchAndExtractZip(accessToken);
    return NextResponse.json({ data: watchHistoryData });
  } catch (error) {
    console.error('Error fetching watch history:', error);
    return NextResponse.json({ error: 'Failed to fetch watch history' }, { status: 500 });
  }
} 