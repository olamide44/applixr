import api, { handleApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { CoverLetter, Resume } from '@/lib/types';
import { DocumentIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function CoverLettersPage() {
  const { user } = useAuth();
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    resume_id: '',
    job_description: '',
    tone: 'formal',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coverLettersRes, resumesRes] = await Promise.all([
        api.get('/cover-letters'),
        api.get('/resumes'),
      ]);
      setCoverLetters(coverLettersRes.data);
      setResumes(resumesRes.data);
    } catch (err) {
      setError(handleApiError(err).detail);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const form = new FormData();
      form.append('resume_id', String(parseInt(formData.resume_id, 10)));
      form.append('job_description', formData.job_description);
      form.append('tone', formData.tone);

      const response = await api.post('/cover-letters/generate', form);
      setCoverLetters([...coverLetters, response.data]);
      setShowForm(false);
      setFormData({
        resume_id: '',
        job_description: '',
        tone: 'formal',
      });
    } catch (err) {
      setError(handleApiError(err).detail);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cover letter?')) return;

    try {
      await api.delete(`/cover-letters/${id}`);
      setCoverLetters(coverLetters.filter(letter => letter.id !== id));
    } catch (err) {
      setError(handleApiError(err).detail);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Cover Letters</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Generate New'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Generate Cover Letter</h3>
            <form onSubmit={handleGenerate} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Resume</label>
                <select
                  value={formData.resume_id}
                  onChange={(e) => setFormData({ ...formData, resume_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a resume</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.file_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Job Description</label>
                <textarea
                  value={formData.job_description}
                  onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Paste the job description here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="formal">Formal</option>
                  <option value="informal">Informal</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="persuasive">Persuasive</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Cover Letter'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {coverLetters.map((letter) => (
            <li key={letter.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentIcon className="h-6 w-6 text-gray-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        Cover Letter for {letter.job_description?.split('\n')[0] || 'Untitled Job'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Generated {new Date(letter.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(letter.content);
                        alert('Cover letter copied to clipboard!');
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleDelete(letter.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Tone: {letter.tone}</p>
                  <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                    {letter.content}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 