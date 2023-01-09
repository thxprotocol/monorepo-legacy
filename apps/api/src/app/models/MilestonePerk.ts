import mongoose from 'mongoose';
import { MilestonePerk as TMilestonePerk } from '@thxnetwork/types/';
import { rewardBaseSchema } from '@thxnetwork/api/models/ERC20Perk';

export type MilestonePerkDocument = mongoose.Document & TMilestonePerk;

const milestonePerkSchema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        amount: Number,
    },
    { timestamps: true },
);

export const MilestonePerk = mongoose.model<MilestonePerkDocument>('milestonePerks', milestonePerkSchema);
