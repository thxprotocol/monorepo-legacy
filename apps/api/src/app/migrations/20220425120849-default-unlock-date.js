module.exports = {
    async up(db) {
        const rewardsColl = db.collection('rewards');
        const rewards = await rewardsColl.find().toArray();
        const promises = rewards.map(async (reward) => {
            try {
                await rewardsColl.updateOne({ _id: reward._id }, { withdrawUnlockDate: Date.now() });
            } catch (error) {
                console.log(error);
            }
        });

        await Promise.all(promises);
    },

    async down(db) {
        await db.collection('membership').updateMany({}, { $unset: { erc20: null } });
    },
};
