export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  created_at: string;
  updated_at: string;
  feedback?: {
    strengths: string[];
    weaknesses: string[];
    missing_sections: string[];
    formatting_issues: string[];
    content_suggestions: string[];
  };
}

export interface CoverLetter {
  id: string;
  user_id: string;
  resume_id: string;
  job_description: string;
  content: string;
  tone: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  company_name: string;
  position: string;
  job_description: string;
  job_url?: string;
  status: 'draft' | 'applied' | 'interview' | 'offer' | 'rejected' | 'accepted';
  application_deadline: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface ApiError {
  detail: string;
  status: number;
} 