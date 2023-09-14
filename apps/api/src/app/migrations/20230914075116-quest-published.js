module.exports = {
    async up(db) {
        const collectionNames = ['dailyrewards', 'referralrewards', 'pointrewards', 'milestonerewards', 'web3quests'];
        for (const name of collectionNames) {
            try {
                await db.collection(name).updateMany({}, { $set: { isPublished: true } });
            } catch (error) {
                console.log(name, error);
            }
        }
    },

    async down() {
        //
    },
};
