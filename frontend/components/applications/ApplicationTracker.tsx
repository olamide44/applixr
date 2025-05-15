import { useState } from 'react';
import { Button } from '../ui/Button';

interface Application {
  id: number;
  company_name: string;
  position: string;
  status: string;
  application_deadline: string | null;
  created_at: string;
}

interface ApplicationTrackerProps {
  applications: Application[];
  onStatusChange: (id: number, status: string) => Promise<void>;
  onAddNote: (id: number, note: string) => Promise<void>;
}

const STATUSES = [
  'draft',
  'applied',
  'interview',
  'offer',
  'rejected',
  'accepted',
];

export const ApplicationTracker = ({
  applications,
  onStatusChange,
  onAddNote,
}: ApplicationTrackerProps) => {
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const handleStatusChange = async (id: number, status: string) => {
    await onStatusChange(id, status);
  };

  const handleAddNote = async (id: number) => {
    if (!noteText.trim()) return;
    await onAddNote(id, noteText);
    setEditingNote(null);
    setNoteText('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-yellow-100 text-yellow-800';
      case 'offer':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {applications.map((app) => (
        <div
          key={app.id}
          className="bg-white rounded-lg shadow p-6 space-y-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {app.position}
              </h3>
              <p className="text-gray-600">{app.company_name}</p>
            </div>
            <select
              value={app.status}
              onChange={(e) => handleStatusChange(app.id, e.target.value)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${getStatusColor(app.status)}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              `}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-500">
            <p>Applied: {new Date(app.created_at).toLocaleDateString()}</p>
            {app.application_deadline && (
              <p>Deadline: {new Date(app.application_deadline).toLocaleDateString()}</p>
            )}
          </div>

          <div className="space-y-2">
            {editingNote === app.id ? (
              <div className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddNote(app.id)}
                    size="sm"
                  >
                    Save Note
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingNote(null);
                      setNoteText('');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setEditingNote(app.id)}
                variant="outline"
                size="sm"
              >
                Add Note
              </Button>
            )}
          </div>
        </div>
      ))}

      {applications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No applications yet</p>
        </div>
      )}
    </div>
  );
}; 