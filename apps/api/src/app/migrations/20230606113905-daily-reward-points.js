module.exports = {
    async up(db) {
        const collection = db.collection('dailyrewards');
        const rewards = await (await collection.find()).toArray();

        for (const reward of rewards) {
            const amounts = Array.from({ length: 7 }).map(() => Number(reward.amount));
            await collection.updateOne({ _id: reward._id }, { $set: { amounts }, $unset: { amount: true } });
        }
    },

    async down() {
        //
    },
};
