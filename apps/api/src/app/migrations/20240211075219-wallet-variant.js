module.exports = {
    async up(db, client) {
        const questColl = db.collection('wallets');

        await questColl.update(
            { safeVersion: { $exists: true }, address: { $exists: true } },
            { $set: { variant: 'safe' } },
        );
        await questColl.update(
            { safeVersion: { $exists: false }, address: { $exists: true } },
            { $set: { variant: 'walletconnect' } },
        );
    },

    async down(db, client) {
        //
    },
};
