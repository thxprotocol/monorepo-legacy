import mongoose from 'mongoose';

export type ClaimDocument = mongoose.Document & TClaim;

const schema = new mongoose.Schema(
    {
        sub: String,
        uuid: String,
        poolId: String,
        redirectUrl: String,
        erc20Id: String,
        erc721Id: String,
        erc1155Id: String,
        rewardUuid: String,
        amount: String,
        claimedAt: Date,
    },
    { timestamps: true },
);

export const Claim = mongoose.model<ClaimDocument>('Claim', schema, 'claims');
