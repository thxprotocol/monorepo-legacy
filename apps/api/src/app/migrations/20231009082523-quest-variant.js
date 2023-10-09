const QuestVariant = {
    Daily: 0,
    Invite: 1,
    Twitter: 2,
    Discord: 3,
    YouTube: 4,
    Custom: 5,
    Web3: 6,
};

const RewardConditionInteraction = {
    None: -1,
    YouTubeLike: 0,
    YouTubeSubscribe: 1,
    TwitterLike: 2,
    TwitterRetweet: 3,
    TwitterFollow: 4,
    DiscordGuildJoined: 5,
    TwitterMessage: 6,
};

const questInteractionVariantMap = {
    [RewardConditionInteraction.TwitterFollow]: QuestVariant.Twitter,
    [RewardConditionInteraction.TwitterLike]: QuestVariant.Twitter,
    [RewardConditionInteraction.TwitterMessage]: QuestVariant.Twitter,
    [RewardConditionInteraction.TwitterRetweet]: QuestVariant.Twitter,
    [RewardConditionInteraction.YouTubeLike]: QuestVariant.YouTube,
    [RewardConditionInteraction.YouTubeSubscribe]: QuestVariant.YouTube,
    [RewardConditionInteraction.DiscordGuildJoined]: QuestVariant.Discord,
};

module.exports = {
    async up(db) {
        for (const { coll, variant } of [
            { coll: db.collection('dailyrewards'), variant: QuestVariant.Daily },
            { coll: db.collection('referralrewards'), variant: QuestVariant.Invite },
            { coll: db.collection('milestonerewards'), variant: QuestVariant.Custom },
            { coll: db.collection('web3quests'), variant: QuestVariant.Web3 },
        ]) {
            await coll.updateMany({}, { $set: { variant } });
        }

        const questCustomColl = db.collection('pointrewards');
        for (const quest of await (await questCustomColl.find()).toArray()) {
            try {
                const variant = questInteractionVariantMap[quest.interaction];
                await questCustomColl.updateOne({ _id: quest._id }, { $set: { variant } });
            } catch (error) {
                console.log(error);
            }
        }
    },

    async down() {
        //
    },
};
