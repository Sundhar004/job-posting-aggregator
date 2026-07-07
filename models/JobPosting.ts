import mongoose, { Schema, Document, Model } from 'mongoose';
import type { JobStatus, WorkMode } from '@/types';

export interface IJobPostingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  sourceUrl?: string;
  rawText?: string;
  jobTitle: string;
  companyName: string;
  location: string | null;
  workMode: WorkMode;
  requiredSkills: string[];
  experienceRequired: string | null;
  salaryRange: string | null;
  applicationDeadline: Date | null;
  jdSummary: string;
  matchPercent: number;
  status: JobStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobPostingSchema: Schema<IJobPostingDocument> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    rawText: {
      type: String,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: null,
      trim: true,
    },
    workMode: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite', 'unknown'],
      default: 'unknown',
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    experienceRequired: {
      type: String,
      default: null,
    },
    salaryRange: {
      type: String,
      default: null,
    },
    applicationDeadline: {
      type: Date,
      default: null,
    },
    jdSummary: {
      type: String,
      default: '',
    },
    matchPercent: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'],
      default: 'Saved',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Add index on userId for fast queries
JobPostingSchema.index({ userId: 1 });
JobPostingSchema.index({ status: 1 });

const JobPosting: Model<IJobPostingDocument> =
  mongoose.models.JobPosting || mongoose.model<IJobPostingDocument>('JobPosting', JobPostingSchema);

export default JobPosting;
