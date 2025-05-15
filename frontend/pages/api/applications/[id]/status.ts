import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify authentication
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const { id } = req.query;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // In a real application, you would:
    // 1. Verify the JWT token
    // 2. Get the user ID from the token
    // 3. Verify that the application belongs to the user
    // 4. Update the application status in the database

    // For now, return mock data
    const mockResponse = {
      id,
      status,
      updated_at: new Date().toISOString(),
    };

    res.status(200).json(mockResponse);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 