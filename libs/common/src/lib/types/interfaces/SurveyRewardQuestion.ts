export type TSurveyRewardQuestion = {
    _id?: string;
    order: number;
    surveyRewardId: string;
    question: string;
    answers: TSurveyRewardAnswer[];
    createdAt: Date;
    updatedAt: Date;
};

export type TSurveyRewardAnswer = {
    _id?: string;
    correct: boolean;
    value: string;
    order: number;
};
