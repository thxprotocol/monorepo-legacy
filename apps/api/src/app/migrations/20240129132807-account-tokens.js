module.exports = {
    async up(db, client) {
        const tokensColl = db.collection('tokens');
        const accountsColl = db.collection('accounts');
        const accounts = await accountsColl.find({});

        for await (const account of accounts.toArra()) {
            console.log(accounts.tokens);
        }
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
