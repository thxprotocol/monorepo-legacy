import { ClaimDocument } from '@thxnetwork/api/types/TClaim';
import mongoose from 'mongoose';

const schema = new mongoose.Schema(
    {
        sub: String,
        uuid: String,
        poolId: String,
        erc20Id: String,
        erc721Id: String,
        rewardUuid: String,
        amount: String,
        claimedAt: Date,
    },
    { timestamps: true },
);

export const Claim = mongoose.model<ClaimDocument>('Claim', schema, 'claims');
