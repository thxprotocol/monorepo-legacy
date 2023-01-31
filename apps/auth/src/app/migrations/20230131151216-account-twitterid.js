module.exports = {
    async up(db) {
        const accountsColl = db.collection('accounts');
        const accounts = await (await accountsColl.find({ twitterId: { $exists: true } })).toArray();

        for (const account of accounts) {
            try {
                const tokens = account.tokens.map((t) => {
                    if (!t.userId) {
                        t.userId = account.twitterId;
                    }
                    return t;
                });
                await accountsColl.updateOne({ _id: account._id }, { $set: { tokens }, $unset: { twitterId: true } });
            } catch {
                //
            }
        }
    },
    async down() {
        //
    },
};
