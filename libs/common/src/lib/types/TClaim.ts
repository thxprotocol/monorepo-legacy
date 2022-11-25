import mongoose from 'mongoose';

export type TClaim = {
    id: string;
    poolId: string;
    rewardId: string;
    erc20Id?: string;
    erc721Id?: string;
};
export type ClaimDocument = mongoose.Document & TClaim;
