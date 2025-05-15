import api, { handleApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Application, CoverLetter, Resume } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumesRes, coverLettersRes, applicationsRes] = await Promise.all([
          api.get('/resumes'),
          api.get('/cover-letters'),
          api.get('/applications'),
        ]);

        setResumes(resumesRes.data);
        setCoverLetters(coverLettersRes.data);
        setApplications(applicationsRes.data);
      } catch (err) {
        setError(handleApiError(err).detail);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {user?.full_name}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-indigo-900">Resumes</h3>
            <p className="text-3xl font-bold text-indigo-600">{resumes.length}</p>
            <Link href="/resumes" className="text-indigo-600 hover:text-indigo-900">
              View all →
            </Link>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-900">Cover Letters</h3>
            <p className="text-3xl font-bold text-green-600">{coverLetters.length}</p>
            <Link href="/cover-letters" className="text-green-600 hover:text-green-900">
              View all →
            </Link>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900">Applications</h3>
            <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
            <Link href="/applications" className="text-blue-600 hover:text-blue-900">
              View all →
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Applications</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.slice(0, 5).map((application) => (
                <tr 
                  key={application.id}
                  onClick={() => router.push(`/applications/${application.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {application.company_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 