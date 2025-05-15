import formidable from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

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
      return handleGetResumes(req, res);
    case 'POST':
      return handleUploadResume(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}

async function handleGetResumes(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In a real application, you would:
    // 1. Verify the JWT token
    // 2. Get the user ID from the token
    // 3. Query the database for the user's resumes

    // For now, return mock data
    const mockResumes = [
      {
        id: '1',
        file_name: 'resume1.pdf',
        feedback: {
          strengths: ['Strong technical skills', 'Good project experience'],
          weaknesses: ['Could use more leadership examples'],
          missing_sections: ['Certifications'],
          formatting_issues: ['Inconsistent spacing'],
          content_suggestions: ['Add more quantifiable achievements'],
        },
      },
    ];

    res.status(200).json(mockResumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleUploadResume(req: NextApiRequest, res: NextApiResponse) {
  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'uploads'),
      keepExtensions: true,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      }
    );

    const file = files.file as formidable.File;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // In a real application, you would:
    // 1. Verify the JWT token
    // 2. Get the user ID from the token
    // 3. Save the file information to the database
    // 4. Process the resume (e.g., extract text, analyze content)

    // For now, return mock data
    const mockResponse = {
      id: '2',
      file_name: file.originalFilename || 'resume.pdf',
      feedback: {
        strengths: ['Good education background', 'Relevant experience'],
        weaknesses: ['Could improve skills section'],
        missing_sections: ['Languages'],
        formatting_issues: ['Font size too small'],
        content_suggestions: ['Add more details about projects'],
      },
    };

    res.status(200).json(mockResponse);
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 