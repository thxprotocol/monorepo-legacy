export enum AccountVariant {
    EmailPassword = 0,
    SSOGoogle = 1,
    SSOTwitter = 2,
    SSOSpotify = 3, // @dev Deprecated
    Metamask = 4,
    SSOGithub = 5,
    SSODiscord = 6,
    SSOTwitch = 7,
}

export enum ReCaptchaAction {
    QuestDailyEntryCreate = 'QUEST_DAILY_ENTRY_CREATE',
    QuestSocialEntryCreate = 'QUEST_SOCIAL_ENTRY_CREATE',
    QuestCustomEntryCreate = 'QUEST_CUSTOM_ENTRY_CREATE',
    QuestWeb3EntryCreate = 'QUEST_WEB3_ENTRY_CREATE',
    QuestGitcoinEntryCreate = 'QUEST_GITCOIN_ENTRY_CREATE',
}
