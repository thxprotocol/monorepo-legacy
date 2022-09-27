module.exports = {
    async up(db) {
        await db.collection('membership').updateMany({}, { $unset: { tokenAddress: '' } });
    },
};
