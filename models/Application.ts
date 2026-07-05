import mongoose, { Schema, Document, Model } from 'mongoose';
import type { JobStatus } from '@/types';

export interface IApplicationDocument extends Document {
  jobId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fromStatus: JobStatus;
  toStatus: JobStatus;
  changedAt: Date;
}

const ApplicationSchema: Schema<IApplicationDocument> = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'JobPosting',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromStatus: {
      type: String,
      enum: ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'],
      required: true,
    },
    toStatus: {
      type: String,
      enum: ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'],
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

ApplicationSchema.index({ jobId: 1 });
ApplicationSchema.index({ userId: 1 });

const Application: Model<IApplicationDocument> =
  mongoose.models.Application || mongoose.model<IApplicationDocument>('Application', ApplicationSchema);

export default Application;
