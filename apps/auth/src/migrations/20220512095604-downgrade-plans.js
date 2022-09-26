module.exports = {
    async up(db) {
        await db.collection('accounts').updateMany({}, { $set: { plan: 0 } });
    },
    async down(db) {
        await db.collection('accounts').updateMany({}, { $unset: { plan: 1 } });
    },
};
