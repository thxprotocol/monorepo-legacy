module.exports = {
    async up(db, client) {
        await db.collection('questdailyentry').updateMany(
            {},
            {
                $rename: {
                    ip: 'metadata.ip',
                },
            },
        );
        await db.collection('questsocialentry').updateMany(
            {},
            {
                $rename: {
                    platformUserId: 'metadata.platformUserId',
                    publicMetrics: 'metadata.twitter',
                },
            },
        );
        await db.collection('questweb3entry').updateMany({}, { $rename: { address: 'metadata.address' } });
        await db.collection('questgitcoinentry').updateMany({}, { $rename: { address: 'metadata.address' } });
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
