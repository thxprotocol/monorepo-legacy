module.exports = {
    async up(db) {
        const withdrawalsColl = db.collection('withdrawals');
        const widgetsColl = db.collection('widgets');
        const rewardsColl = db.collection('rewards');

        const rewards = await rewardsColl.find({ id: { $type: 'number' } }).toArray();
        await Promise.all(
            rewards.map(async (r) => {
                await rewardsColl.updateOne({ _id: r._id }, { $set: { id: String(r.id) } });
            }),
        );

        const withdrawals = await withdrawalsColl.find({ rewardId: { $type: 'number' } }).toArray();
        await Promise.all(
            withdrawals.map(async (w) => {
                await withdrawalsColl.updateOne({ _id: w._id }, { $set: { rewardId: String(w.rewardId) } });
            }),
        );

        const widgets = await widgetsColl.find({ 'metadata.rewardId': { $type: 'number' } }).toArray();
        await Promise.all(
            widgets.map(async (w) => {
                await widgetsColl.updateOne(
                    { _id: w._id },
                    { $set: { 'metadata.rewardId': String(w.metadata.rewardId) } },
                );
            }),
        );
    },
    async down() {
        //
    },
};
