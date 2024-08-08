type TQuest = TQuestDaily | TQuestInvite | TQuestSocial | TQuestCustom | TQuestWeb3 | TQuestGitcoin | TQuestWebhook;
type TQuestEntry =
    | TQuestDailyEntry
    | TQuestInviteEntry
    | TQuestSocialEntry
    | TQuestCustomEntry
    | TQuestWeb3Entry
    | TQuestGitcoinEntry
    | TQuestWebhookEntry;

type TQuestEntryMetadata = TQuestSocialEntryMetadata | TQuestWeb3EntryMetadata;

type TValidationResult = {
    reason: string;
    result: boolean;
};

type TBaseQuestEntry = {
    _id: string;
    poolId: string;
    questId: string;
    sub: string;
    amount: number;
    recaptcha: string;
    ip: string;
    status: QuestEntryState;
    createdAt: Date;
};

type TBaseQuest = {
    _id: string;
    variant: QuestVariant;
    uuid: string;
    poolId: string;
    title: string;
    description: string;
    index: number;
    image: string;
    infoLinks: TInfoLink[];
    expiryDate: Date | string;
    locks: TQuestLock[];
    isPublished: boolean;
    isIPLimitEnabled: boolean;
    isReviewEnabled: boolean;
    createdAt: string;
    updatedAt: string;
};
