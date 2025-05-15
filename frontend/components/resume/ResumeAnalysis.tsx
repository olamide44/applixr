import { useState } from 'react';
import { Button } from '../ui/Button';

interface Feedback {
  missing_sections: string[];
  formatting_issues: string[];
  content_suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

interface ResumeAnalysisProps {
  feedback: Feedback;
  onAnalyzeJob?: (jobDescription: string) => Promise<void>;
}

export const ResumeAnalysis = ({ feedback, onAnalyzeJob }: ResumeAnalysisProps) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeJob = async () => {
    if (!jobDescription.trim()) return;
    
    setIsAnalyzing(true);
    try {
      await onAnalyzeJob?.(jobDescription);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Strengths</h3>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
          <ul className="space-y-2">
            {feedback.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-500 mr-2">⚠</span>
                <span className="text-gray-700">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Missing Sections</h3>
        <ul className="space-y-2">
          {feedback.missing_sections.map((section, index) => (
            <li key={index} className="flex items-start">
              <span className="text-red-500 mr-2">×</span>
              <span className="text-gray-700">{section}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Formatting Issues</h3>
        <ul className="space-y-2">
          {feedback.formatting_issues.map((issue, index) => (
            <li key={index} className="flex items-start">
              <span className="text-red-500 mr-2">×</span>
              <span className="text-gray-700">{issue}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Content Suggestions</h3>
        <ul className="space-y-2">
          {feedback.content_suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">💡</span>
              <span className="text-gray-700">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      {onAnalyzeJob && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Analyze Against Job Description</h3>
          <div className="space-y-4">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={handleAnalyzeJob}
              disabled={!jobDescription.trim() || isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Match'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 