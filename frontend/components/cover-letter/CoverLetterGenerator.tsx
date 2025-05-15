import { useState } from 'react';
import { Button } from '../ui/Button';

interface Resume {
  id: number;
  file_name: string;
}

interface CoverLetterGeneratorProps {
  resumes: Resume[];
  onGenerate: (resumeId: number, jobDescription: string, tone: string) => Promise<void>;
  isGenerating: boolean;
}

const TONES = [
  { value: 'formal', label: 'Formal' },
  { value: 'informal', label: 'Informal' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'persuasive', label: 'Persuasive' },
];

export const CoverLetterGenerator = ({
  resumes,
  onGenerate,
  isGenerating,
}: CoverLetterGeneratorProps) => {
  const [resumeId, setResumeId] = useState<number | ''>('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('formal');

  const handleGenerate = async () => {
    if (!resumeId || !jobDescription.trim()) return;
    await onGenerate(resumeId, jobDescription, tone);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Select Resume
        </label>
        <select
          value={resumeId}
          onChange={(e) => setResumeId(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a resume...</option>
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.file_name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-48 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Tone
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TONES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={`
                p-3 text-center rounded-md border transition-colors
                ${tone === t.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!resumeId || !jobDescription.trim() || isGenerating}
        className="w-full"
      >
        {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
      </Button>
    </div>
  );
}; 