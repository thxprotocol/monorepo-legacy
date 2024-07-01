type TQuestWebhook = TBaseQuest & {
    amount: number;
    webhookId: string;
    metadata: string;
    isAmountCustom: boolean;
};
