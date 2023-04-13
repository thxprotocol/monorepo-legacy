import { TBaseReward } from './BaseReward';
import { TSurveyRewardQuestion } from './SurveyRewardQuestion';

export type TSurveyReward = TBaseReward & {
    amount: number;
    questions: TSurveyRewardQuestion[];
};
