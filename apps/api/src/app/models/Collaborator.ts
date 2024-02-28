import mongoose from 'mongoose';

export type CollaboratorDocument = mongoose.Document & TCollaborator;

export const Collaborator = mongoose.model<CollaboratorDocument>(
    'Collaborator',
    new mongoose.Schema(
        {
            sub: String,
            poolId: String,
            email: String,
            uuid: String,
            state: Number,
        },
        { timestamps: true },
    ),
    'collaborator',
);
