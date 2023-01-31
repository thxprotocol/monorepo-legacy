module.exports = {
    async up(db) {
        await db.collection('erc20perks').updateMany({}, { $set: { claimLimit: 1 } });
        await db.collection('erc721perks').updateMany({}, { $set: { claimLimit: 1 } });
    },

    async down() {
        //
    },
};
