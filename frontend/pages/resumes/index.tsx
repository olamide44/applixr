import { useEffect, useState } from 'react';
import { ResumeAnalysis } from '../../components/resume/ResumeAnalysis';
import { ResumeUpload } from '../../components/resume/ResumeUpload';

interface Feedback {
  strengths: string[];
  weaknesses: string[];
  missing_sections: string[];
  formatting_issues: string[];
  content_suggestions: string[];
}

interface Resume {
  id: string;
  file_name: string;
  ai_feedback: Feedback;
  created_at?: string;
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch resumes on mount
  useEffect(() => {
    const fetchResumes = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://applixr-backend-production.up.railway.app/resumes/upload`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch resumes');
        const data = await res.json();
        setResumes(data);
        if (data.length > 0) setSelectedResume(data[0]);
      } catch (err: any) {
        setError(err.message || 'Error loading resumes');
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  // Upload resume
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('https://applixr-backend-production.up.railway.app/resumes/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload resume');
      const newResume = await res.json();
      setResumes((prev) => [newResume, ...prev]);
      setSelectedResume(newResume);
    } catch (err: any) {
      setError(err.message || 'Error uploading resume');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Resumes</h1>
      <ResumeUpload onUpload={handleUpload} isUploading={isUploading} />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Uploaded Resumes</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : resumes.length === 0 ? (
          <p className="text-gray-500">No resumes uploaded yet.</p>
        ) : (
          <ul className="space-y-4">
            {resumes.map((resume) => (
              <li
                key={resume.id}
                className={`p-4 border rounded-lg cursor-pointer ${selectedResume?.id === resume.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => setSelectedResume(resume)}
              >
                <span className="font-medium">{resume.file_name}</span>
                {resume.created_at && (
                  <span className="ml-2 text-xs text-gray-400">
                    {new Date(resume.created_at).toLocaleString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedResume && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">AI Feedback</h2>
          <ResumeAnalysis feedback={selectedResume.ai_feedback} />
        </div>
      )}
    </div>
  );
} 