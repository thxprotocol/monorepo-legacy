import mongoose from 'mongoose';
import { TSurveyRewardQuestion } from '@thxnetwork/types/interfaces';

export type SurveyRewardQuestionDocument = mongoose.Document & TSurveyRewardQuestion;

const schema = new mongoose.Schema(
    {
        surveyRewardId: String,
        question: String,
        order: Number,
        answers: [{ correct: Boolean, value: String, order: Number }],
    },
    { timestamps: true },
);

export const SurveyRewardQuestion = mongoose.model<TSurveyRewardQuestion>('surveyrewardquestions', schema);
