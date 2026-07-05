// ============================================================
// Shared TypeScript Interfaces & Types
// ============================================================

export type JobStatus = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
export type WorkMode = 'remote' | 'hybrid' | 'onsite' | 'unknown';

export interface ExtractedJob {
  jobTitle: string;
  companyName: string;
  location: string | null;
  workMode: WorkMode;
  requiredSkills: string[];
  experienceRequired: string | null;
  salaryRange: string | null;
  applicationDeadline: string | null; // ISO date string or null
  jdSummary: string;
}

export interface IJobPosting {
  _id: string;
  userId: string;
  sourceUrl?: string;
  rawText?: string;
  jobTitle: string;
  companyName: string;
  location: string | null;
  workMode: WorkMode;
  requiredSkills: string[];
  experienceRequired: string | null;
  salaryRange: string | null;
  applicationDeadline: string | null;
  jdSummary: string;
  matchPercent: number;
  status: JobStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  email: string;
  name: string;
  skills: string[];
  createdAt: string;
}

export interface IApplication {
  _id: string;
  jobId: string;
  userId: string;
  fromStatus: JobStatus;
  toStatus: JobStatus;
  changedAt: string;
}

export interface KanbanColumn {
  id: JobStatus;
  title: string;
  color: string;
  jobs: IJobPosting[];
}
