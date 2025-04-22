import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAndExtractZip } from '@/lib/google-drive-backend';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken, fileId } = req.body;

  if (!accessToken || !fileId) {
    return res.status(400).json({ error: 'Missing accessToken or fileId' });
  }

  try {
    // Fetch and extract the `watch-history.json` file
    const watchHistoryData = await fetchAndExtractZip(accessToken);
    res.status(200).json(watchHistoryData);
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: 'Failed to fetch and extract watch history data' });
  }
}