type TQuestSocial = TBaseQuest & {
    amount: number;
    platform: number; // Deprecate in favor of kind
    kind: AccessTokenKind;
    interaction: QuestSocialRequirement;
    content: string;
    contentMetadata: any;
    entries?: TQuestSocialEntry[];
};

type TTwitterQuery = {
    _id: string;
    createdAt: Date;
    poolId: string;
    query: string;
    matchCount: number;
    operators: {
        from: string[];
        to: string[];
        text: string[];
        url: string[];
        hashtags: string[];
        cashtags: string[];
        mentions: string[];
        media: string | null;
        maxAgeInSeconds: number;
        likeCount: number;
        repostCount: number;
    };
};
