import mongoose from 'mongoose';
import { TSurveyRewardClaim } from '@thxnetwork/types/interfaces';

export type SurveyRewardClaimDocument = mongoose.Document & TSurveyRewardClaim;

const schema = new mongoose.Schema(
    {
        sub: String,
        surveyRewardId: String,
        amount: Number,
        poolId: String,
    },
    { timestamps: true },
);

export const SurveyRewardClaim = mongoose.model<TSurveyRewardClaim>('surveyrewardclaims', schema);
