import { ClaimDocument } from '@thxnetwork/api/types/TClaim';
import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        sub: String,
        id: String,
        poolId: String,
        erc20Id: String,
        erc721Id: String,
        rewardId: String,
    },
    { timestamps: true },
);

export const Claim = mongoose.model<ClaimDocument>('Claim', schema, 'claims');
