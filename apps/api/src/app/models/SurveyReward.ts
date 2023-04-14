import mongoose from 'mongoose';
import { TSurveyReward } from '@thxnetwork/types/interfaces';
import { rewardBaseSchema } from './ERC20Perk';
import { SurveyRewardQuestion } from './SurveyRewardQuestion';

export type SurveyRewardDocument = mongoose.Document & TSurveyReward;

const schema = new mongoose.Schema(
    {
        ...rewardBaseSchema,
        amount: Number,
    },
    { timestamps: true },
);
schema.virtual('questions').get(async function () {
    return await SurveyRewardQuestion.find({ surveyRewardId: this._id }).sort({ order: 'asc' });
});
export const SurveyReward = mongoose.model<SurveyRewardDocument>('surveyrewards', schema);
