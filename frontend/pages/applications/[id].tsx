import api, { handleApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Application } from '@/lib/types';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ApplicationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await api.get(`/applications/${id}`);
      setApplication(response.data);
    } catch (err) {
      setError(handleApiError(err).detail);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Application['status']) => {
    try {
      const form = new FormData();
      form.append('status', newStatus);

      await api.patch(`/applications/${id}`, form);
      setApplication(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      setError(handleApiError(err).detail);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      await api.delete(`/applications/${id}`);
      router.push('/applications');
    } catch (err) {
      setError(handleApiError(err).detail);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const form = new FormData();
      const updatedNotes = application.notes 
        ? `${application.notes}\n${newNote.trim()}`
        : newNote.trim();
      form.append('notes', updatedNotes);

      await api.patch(`/applications/${id}`, form);
      const response = await api.get(`/applications/${id}`);
      setApplication(response.data);
      setNewNote('');
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

  if (!application) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Application not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
        <button
          onClick={() => router.push('/applications')}
          className="text-indigo-600 hover:text-indigo-900"
        >
          ← Back to Applications
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{application.position}</h2>
              <p className="text-lg text-gray-600">{application.company_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={application.status}
                onChange={(e) => handleStatusChange(e.target.value as Application['status'])}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
              </select>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Application Deadline</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(application.application_deadline).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Applied Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(application.created_at).toLocaleDateString()}
                  </dd>
                </div>
                {application.job_url && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Job URL</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a
                        href={application.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {application.job_url}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Job Description</h3>
              <div className="mt-4 prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{application.job_description}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Notes</h3>
              <div className="mt-4 space-y-4">
                {application.notes ? (
                  <ul className="space-y-4">
                    {application.notes.split('\n').filter(note => note.trim()).map((note, index) => (
                      <li key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-900">{note}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No notes yet</p>
                )}

                <form onSubmit={handleAddNote} className="mt-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Add Note
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 