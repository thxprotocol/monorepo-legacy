module.exports = {
    async up(db) {
        const poolDocs = await db.collection('assetpools').find({});
        for (const pool of await poolDocs.toArray()) {
            const quests = [];
            for (const name of ['dailyrewards', 'milestonerewards', 'pointrewards', 'referralrewards']) {
                const collection = db.collection(name);
                const items = await (await collection.find({ poolId: String(pool._id) })).toArray();
                items.forEach((item) => {
                    quests.push({ collection, item });
                });
            }
            console.log(quests);
            for (let i = 0; i < quests.length; i++) {
                const { collection, item } = quests[i];
                await collection.update({ _id: item._id }, { $set: { index: i } });
            }
        }
    },

    async down() {
        //
    },
};
