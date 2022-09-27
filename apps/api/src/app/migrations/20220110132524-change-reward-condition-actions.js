module.exports = {
    async up(db) {
        const rewardsColl = db.collection('rewards');

        for (const reward of await rewardsColl.find().toArray()) {
            if (reward.withdrawCondition && reward.withdrawCondition.channelAction === 0) {
                await rewardsColl.updateOne(
                    { poolAddress: reward.poolAddress, id: reward.id },
                    { $unset: { withdrawCondition: {} } },
                );
            }
            if (reward.withdrawCondition && reward.withdrawCondition.channelAction > 0) {
                await rewardsColl.updateOne(
                    { poolAddress: reward.poolAddress, id: reward.id },
                    { $set: { 'withdrawCondition.channelAction': reward.withdrawCondition.channelAction - 1 } },
                );
            }
        }
    },

    async down(db) {
        const rewardsColl = db.collection('rewards');

        for (const reward of await rewardsColl.find().toArray()) {
            if (reward.withdrawCondition) {
                await rewardsColl.updateOne(
                    { poolAddress: reward.poolAddress, id: reward.id },
                    { $set: { 'withdrawCondition.channelAction': reward.withdrawCondition.channelAction + 1 } },
                );
            }
        }
    },
};
