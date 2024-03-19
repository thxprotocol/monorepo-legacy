module.exports = {
    async up(db) {
        await db
            .collection('questweb3')
            .updateMany({ threshold: { $exists: true } }, [{ $set: { threshold: { $toString: '$threshold' } } }]);
    },

    async down() {
        //
    },
};
