import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui/Button';

interface ResumeUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export const ResumeUpload = ({ onUpload, isUploading }: ResumeUploadProps) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!file.name.match(/\.(pdf|docx)$/i)) {
      setError('Only PDF and DOCX files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('File size must be less than 5MB');
      return;
    }

    try {
      await onUpload(file);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-6xl mb-4">📄</div>
          {isDragActive ? (
            <p className="text-lg text-gray-600">Drop your resume here...</p>
          ) : (
            <>
              <p className="text-lg text-gray-600">
                Drag and drop your resume here, or click to select a file
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: PDF, DOCX (max 5MB)
              </p>
            </>
          )}
          {!isDragActive && (
            <Button
              variant="outline"
              className="mt-4"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Select File'}
            </Button>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}; 