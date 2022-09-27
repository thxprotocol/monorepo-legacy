import mongoose from 'mongoose';

export type TClaim = {
    poolId: string;
    rewardId: string;
    erc20Id?: string;
    erc721Id?: string;
};
export type ClaimDocument = mongoose.Document & TClaim;
