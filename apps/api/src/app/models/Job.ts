import mongoose from 'mongoose';

export type JobDocument = mongoose.Document & TJob;

export const Job = mongoose.model<JobDocument>(
    'Job',
    new mongoose.Schema(
        {
            name: String,
            data: Object,
            lastRunAt: Date,
            failedAt: Date,
            failReason: String,
        },
        { timestamps: true },
    ),
    'jobs',
);
