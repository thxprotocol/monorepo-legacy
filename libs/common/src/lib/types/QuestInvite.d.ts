type TQuestInvite = TBaseQuest & {
    successUrl: string;
    pathname: string;
    token: string;
    amount: number;
    isMandatoryReview: boolean;
};
