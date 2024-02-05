module.exports = {
    async up(db, client) {
        const questColl = db.collection('pointrewards');

        // Bulk change twitter quests for platform
        await questColl.update({ platform: 1 }, { kind: 'twitter' });
        await questColl.update({ platform: 1 }, { kind: 'twitter' });
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
