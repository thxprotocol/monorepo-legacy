module.exports = {
    async up(db) {
        await db.collection('pointrewards').deleteMany({ platform: 7 });
    },

    async down() {
        //
    },
};
