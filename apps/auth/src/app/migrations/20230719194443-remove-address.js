module.exports = {
    async up(db) {
        await db.collection('accounts').updateMany({}, { $unset: { address: true } });
    },

    async down() {
        //
    },
};
