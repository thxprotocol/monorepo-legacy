module.exports = {
    async up(db) {
        for (const coll of [
            db.collection('dailyrewards'),
            db.collection('referralrewards'),
            db.collection('pointrewards'),
            db.collection('milestonerewards'),
            db.collection('web3quests'),
            db.collection('erc20perks'),
            db.collection('erc721perks'),
            db.collection('customrewards'),
            db.collection('couponrewards'),
            db.collection('discordrolerewards'),
        ]) {
            await coll.updateMany({}, { $set: { locks: [] } });
        }
    },

    async down() {
        //
    },
};
