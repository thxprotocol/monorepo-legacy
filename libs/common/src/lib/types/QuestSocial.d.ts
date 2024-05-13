type TQuestSocial = TBaseQuest & {
    amount: number;
    platform: number; // Deprecate in favor of kind
    kind: AccessTokenKind;
    interaction: QuestSocialRequirement;
    content: string;
    contentMetadata: any;
    entries?: TQuestSocialEntry[];
};
