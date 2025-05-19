import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  
  if (!session?.user?.isAdmin) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/application-stats`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch application stats');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 