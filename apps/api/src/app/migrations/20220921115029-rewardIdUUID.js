const { v4 } = require('uuid');

module.exports = {
    async up(db) {
        const rewardsColl = db.collection('rewards');
        const claimsColl = db.collection('claims');
        const withdrawalsColl = db.collection('withdrawals');
        const widgetColl = db.collection('widget');
        const rewards = await (await rewardsColl.find({ $expr: { $eq: [{ $toString: '$_id' }, '$id'] } })).toArray();

        const promises = (await rewards).map(async (reward) => {
            try {
                const UUID = v4();
                await rewardsColl.updateOne({ _id: reward._id }, { $set: { id: UUID } });
                await claimsColl.updateOne({ rewardId: String(reward._id) }, { $set: { rewardId: UUID } });
                await withdrawalsColl.updateOne({ rewardId: String(reward._id) }, { $set: { rewardId: UUID } });
                await widgetColl.updateOne({ rewardId: String(reward._id) }, { $set: { rewardId: UUID } });
            } catch (error) {
                console.error(error);
            }
        });

        await Promise.all(promises);
    },
    async down() {
        //
    },
};
