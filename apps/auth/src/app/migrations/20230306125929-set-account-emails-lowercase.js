module.exports = {
    async up(db) {
        await db
            .collection('accounts')
            .updateMany({ email: { $exists: true } }, [{ $set: { email: { $toLower: '$email' } } }]);
    },
    async down() {
        //
    },
};
