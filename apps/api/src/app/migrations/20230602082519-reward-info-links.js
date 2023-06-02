module.exports = {
    async up(db) {
        for (const name of ['dailyrewards', 'milestonerewards', 'pointrewards', 'referralrewards']) {
            const collection = db.collection(name);
            await collection.updateMany({}, { $set: { infoLinks: [] } });
        }
    },

    async down() {
        //
    },
};
