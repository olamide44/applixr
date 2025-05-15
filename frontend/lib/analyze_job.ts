import api from './api';

export interface JobAnalysis {
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string;
  company_culture: string[];
  key_responsibilities: string[];
  growth_opportunities: string[];
  salary_range?: string;
  benefits?: string[];
  match_score?: number;
  missing_skills?: string[];
  recommendations?: string[];
}

export interface JobMatch {
  score: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendations: string[];
}

export async function analyzeJobDescription(jobDescription: string): Promise<JobAnalysis> {
  try {
    const response = await api.post('/jobs/analyze', { job_description: jobDescription });
    return response.data;
  } catch (error) {
    console.error('Error analyzing job description:', error);
    throw error;
  }
}

export async function matchResumeToJob(jobDescription: string, resumeId: string): Promise<JobMatch> {
  try {
    const response = await api.post('/jobs/match', {
      job_description: jobDescription,
      resume_id: resumeId
    });
    return response.data;
  } catch (error) {
    console.error('Error matching resume to job:', error);
    throw error;
  }
}

export async function generateCoverLetterPrompt(
  jobDescription: string,
  resumeId: string,
  tone: 'professional' | 'friendly' | 'enthusiastic' = 'professional'
): Promise<string> {
  try {
    const response = await api.post('/jobs/generate-cover-letter-prompt', {
      job_description: jobDescription,
      resume_id: resumeId,
      tone
    });
    return response.data.prompt;
  } catch (error) {
    console.error('Error generating cover letter prompt:', error);
    throw error;
  }
}

export async function extractKeyRequirements(jobDescription: string): Promise<string[]> {
  try {
    const response = await api.post('/jobs/extract-requirements', {
      job_description: jobDescription
    });
    return response.data.requirements;
  } catch (error) {
    console.error('Error extracting key requirements:', error);
    throw error;
  }
}

export async function suggestResumeImprovements(
  jobDescription: string,
  resumeId: string
): Promise<string[]> {
  try {
    const response = await api.post('/jobs/suggest-improvements', {
      job_description: jobDescription,
      resume_id: resumeId
    });
    return response.data.suggestions;
  } catch (error) {
    console.error('Error suggesting resume improvements:', error);
    throw error;
  }
}

export function calculateMatchScore(
  requiredSkills: string[],
  userSkills: string[]
): number {
  const matchingSkills = requiredSkills.filter(skill =>
    userSkills.some(userSkill =>
      userSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
  return (matchingSkills.length / requiredSkills.length) * 100;
}

export function formatJobAnalysis(analysis: JobAnalysis): string {
  return `
Job Analysis Results:

Required Skills:
${analysis.required_skills.map(skill => `- ${skill}`).join('\n')}

Preferred Skills:
${analysis.preferred_skills.map(skill => `- ${skill}`).join('\n')}

Experience Level: ${analysis.experience_level}

Company Culture:
${analysis.company_culture.map(culture => `- ${culture}`).join('\n')}

Key Responsibilities:
${analysis.key_responsibilities.map(resp => `- ${resp}`).join('\n')}

Growth Opportunities:
${analysis.growth_opportunities.map(opp => `- ${opp}`).join('\n')}

${analysis.salary_range ? `Salary Range: ${analysis.salary_range}\n` : ''}

${analysis.benefits ? `Benefits:\n${analysis.benefits.map(benefit => `- ${benefit}`).join('\n')}\n` : ''}

${analysis.match_score ? `Match Score: ${analysis.match_score}%\n` : ''}

${analysis.missing_skills ? `Missing Skills:\n${analysis.missing_skills.map(skill => `- ${skill}`).join('\n')}\n` : ''}

${analysis.recommendations ? `Recommendations:\n${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}` : ''}
  `.trim();
} 