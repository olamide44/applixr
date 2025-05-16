import api, { handleApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Application } from '@/lib/types';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    job_description: '',
    application_deadline: '',
    cover_letter_id: '',
    job_url: '',
    status: 'applied' as const,
  });
  const [resumes, setResumes] = useState<{ id: string; file_name: string }[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
    fetchResumes();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/');
      setApplications(response.data);
    } catch (err) {
      setError(handleApiError(err).detail);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes/');
      setResumes(response.data);
    } catch (err) {
      setError(handleApiError(err).detail);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('company_name', formData.company_name);
      form.append('position', formData.position);
      form.append('application_deadline', formData.application_deadline);
      form.append('notes', formData.job_description);
      form.append('resume_id', selectedResumeId);
      if (formData.cover_letter_id) form.append('cover_letter_id', formData.cover_letter_id);
      if (formData.job_url) form.append('job_url', formData.job_url);

      const response = await api.post('/applications/', form);
      setApplications([...applications, response.data]);
      setShowForm(false);
      setFormData({
        company_name: '',
        position: '',
        job_description: '',
        application_deadline: '',
        cover_letter_id: '',
        job_url: '',
        status: 'applied',
      });
      setSelectedResumeId('');
    } catch (err) {
      setError(handleApiError(err).detail);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Application['status']) => {
    try {
      const form = new FormData();
      form.append('status', newStatus);

      await api.patch(`/applications/${id}`, form);
      setApplications(
        applications.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      setError(handleApiError(err).detail);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      await api.delete(`/applications/${id}`);
      setApplications(applications.filter((app) => app.id !== id));
    } catch (err) {
      setError(handleApiError(err).detail);
    }
  };

  const handleAddNote = async (id: string, note: string) => {
    try {
      await api.post(`/applications/${id}/notes`, { note });
      const response = await api.get(`/applications/${id}`);
      setApplications(
        applications.map((app) =>
          app.id === id ? response.data : app
        )
      );
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
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Add Application'}
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
            <h3 className="text-lg font-medium text-gray-900">Add New Application</h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Job Description / Notes</label>
                <textarea
                  value={formData.job_description}
                  onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Job URL</label>
                <input
                  type="url"
                  value={formData.job_url}
                  onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cover Letter (optional)</label>
                <input
                  type="text"
                  value={formData.cover_letter_id}
                  onChange={(e) => setFormData({ ...formData, cover_letter_id: e.target.value })}
                  placeholder="Enter cover letter ID if available"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Resume</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
                <input
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add Application
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {applications.map((application) => (
            <li key={application.id}>
              <div 
                className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/applications/${application.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{application.position}</h3>
                    <p className="text-sm text-gray-500">{application.company_name}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={application.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(application.id, e.target.value as Application['status']);
                      }}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                      <option value="accepted">Accepted</option>
                    </select>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(application.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Deadline: {new Date(application.application_deadline).toLocaleDateString()}
                  </p>
                  {application.job_description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {application.job_description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
