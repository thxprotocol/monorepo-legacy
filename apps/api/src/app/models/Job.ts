import mongoose from 'mongoose';

export type JobDocument = mongoose.Document & TJob;

const jobSchema = new mongoose.Schema(
    {
        name: String,
        data: Object,
        lastRunAt: Date,
        failedAt: Date,
        failReason: String,
    },
    { timestamps: true },
);

export const Job = mongoose.model<JobDocument>('Job', jobSchema, 'jobs');
