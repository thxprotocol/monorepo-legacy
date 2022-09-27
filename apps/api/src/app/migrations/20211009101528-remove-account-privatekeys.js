module.exports = {
    async up(db) {
        await db.collection('accounts').updateMany({}, { $unset: { privateKeys: '' } });
    },

    async down(db) {
        await db.collection('accounts').updateMany({}, { $set: { privateKeys: '' } });
    },
};
