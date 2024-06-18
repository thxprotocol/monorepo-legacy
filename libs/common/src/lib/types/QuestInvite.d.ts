type TQuestInvite = TBaseQuest & {
    amount: number;
    amountInvitee: number;
    requiredQuest: { questId: string; variant: QuestVariant };
};

type TInvitee = { username: string; createdAt: Date };

type TQuestInviteCode = {
    questId: string;
    sub: string;
    code: string;
};
