module.exports = {
    async up(db, client) {
        // TODO write your migration here.
        // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
        // Example:
        const subscriptions = await db.collection('poolsubscriptions').find({}).toArray();
        const operations = subscriptions.map(({ sub, poolId }) => {
            return {
                updateOne: {
                    filter: { sub, poolId },
                    update: {
                        $set: {
                            isSubscribed: true,
                        },
                    },
                    upsert: false,
                },
            };
        });
        db.collection('participants').bulkWrite(operations);
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
