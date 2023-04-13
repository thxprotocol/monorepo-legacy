import mongoose from 'mongoose';
import { TSurveyRewardAttemp } from '@thxnetwork/types/interfaces';

export type SurveyRewardAttempDocument = mongoose.Document & TSurveyRewardAttemp;

const schema = new mongoose.Schema(
    {
        sub: String,
        surveyRewardId: String,
        result: Boolean,
    },
    { timestamps: true },
);

export const SurveyRewardAttemp = mongoose.model<TSurveyRewardAttemp>('surveyrewardattemps', schema);
