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

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const { resume_id, job_description, tone } = req.body;

    if (!resume_id || !job_description || !tone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // In a real application, you would:
    // 1. Verify the JWT token
    // 2. Get the user ID from the token
    // 3. Verify that the resume belongs to the user
    // 4. Use an AI service to generate a cover letter based on the resume and job description
    // 5. Return the generated cover letter

    // For now, return a mock cover letter
    const mockCoverLetter = {
      content: `Dear Hiring Manager,

I am writing to express my strong interest in the [Position] role at [Company]. With my background in [Field] and experience in [Relevant Experience], I am confident in my ability to contribute effectively to your team.

In my current role, I have [Achievement 1] and [Achievement 2], which align well with the requirements of this position. I am particularly drawn to [Company] because of its [Company Attribute] and commitment to [Company Value].

I would welcome the opportunity to discuss how my skills and experience would benefit [Company]. Thank you for considering my application.

Best regards,
[Your Name]`,
      tone: tone,
      word_count: 150,
      sections: [
        'Introduction',
        'Experience and Qualifications',
        'Company Interest',
        'Closing',
      ],
    };

    res.status(200).json(mockCoverLetter);
  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 