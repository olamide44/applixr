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

  switch (req.method) {
    case 'GET':
      return handleGetApplications(req, res);
    case 'POST':
      return handleCreateApplication(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}

async function handleGetApplications(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In a real application, you would:
    // 1. Verify the JWT token
    // 2. Get the user ID from the token
    // 3. Query the database for the user's applications

    // For now, return mock data
    const mockApplications = [
      {
        id: '1',
        company_name: 'Tech Corp',
        position: 'Senior Software Engineer',
        status: 'Applied',
        application_deadline: '2024-04-01',
        created_at: '2024-03-15',
        notes: [
          {
            id: '1',
            content: 'Submitted application through company website',
            created_at: '2024-03-15',
          },
        ],
      },
      {
        id: '2',
        company_name: 'Startup Inc',
        position: 'Full Stack Developer',
        status: 'Interview Scheduled',
        application_deadline: '2024-03-30',
        created_at: '2024-03-10',
        notes: [
          {
            id: '2',
            content: 'Phone interview scheduled for March 20',
            created_at: '2024-03-15',
          },
        ],
      },
    ];

    res.status(200).json(mockApplications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleCreateApplication(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { company_name, position, application_deadline } = req.body;

    if (!company_name || !position || !application_deadline) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // In a real application, you would:
    // 1. Verify the JWT token
    // 2. Get the user ID from the token
    // 3. Create a new application in the database

    // For now, return mock data
    const mockApplication = {
      id: '3',
      company_name,
      position,
      status: 'Applied',
      application_deadline,
      created_at: new Date().toISOString().split('T')[0],
      notes: [],
    };

    res.status(201).json(mockApplication);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 