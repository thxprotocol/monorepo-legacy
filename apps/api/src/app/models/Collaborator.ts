import mongoose from 'mongoose';

export type CollaboratorDocument = mongoose.Document & TCollaborator;

const collaboratorSchema = new mongoose.Schema(
    {
        sub: String,
        poolId: String,
        email: String,
        uuid: String,
        state: Number,
    },
    { timestamps: true },
);

export const Collaborator = mongoose.model<CollaboratorDocument>('Collaborator', collaboratorSchema, 'collaborators');
