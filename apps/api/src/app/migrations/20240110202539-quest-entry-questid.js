module.exports = {
    async up(db) {
        await db
            .collection('dailyrewardclaims')
            .update({ dailyRewardId: { $exists: true } }, { $rename: { dailyRewardId: 'questId' } }, { multi: true });

        await db
            .collection('referralrewardclaims')
            .update(
                { referralRewardId: { $exists: true } },
                { $rename: { referralRewardId: 'questId' } },
                { multi: true },
            );
        await db
            .collection('pointrewardclaims')
            .update({ pointRewardId: { $exists: true } }, { $rename: { pointRewardId: 'questId' } }, { multi: true });

        await db
            .collection('milestonerewardclaims')
            .update(
                { milestoneRewardId: { $exists: true } },
                { $rename: { milestoneRewardId: 'questId' } },
                { multi: true },
            );

        await db
            .collection('web3questclaims')
            .update({ web3QuestId: { $exists: true } }, { $rename: { web3QuestId: 'questId' } }, { multi: true });
    },

    async down() {
        //
    },
};
