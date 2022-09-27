module.exports = {
    async up(db) {
        await db.collection('accounts').updateMany({}, { $set: { plan: 1 } });
    },
    async down(db) {
        await db.collection('accounts').updateMany({}, { $unset: { plan: null } });
    },
};
