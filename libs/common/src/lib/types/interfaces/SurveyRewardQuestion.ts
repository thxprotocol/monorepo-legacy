export type TSurveyRewardQuestion = {
    _id: string;
    surveyRewardId: string;
    question: string;
    answers: TSurveyRewardAnswer[];
    createdAt: Date;
    updatedAt: Date;
};

export type TSurveyRewardAnswer = {
    index: number;
    correct: boolean;
    value: string;
};
