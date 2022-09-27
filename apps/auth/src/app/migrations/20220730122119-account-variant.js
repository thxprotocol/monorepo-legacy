module.exports = {
    async up(db) {
        const accountsColl = db.collection('accounts');
        const accounts = await accountsColl.find().toArray();

        await Promise.all(
            accounts.map((account) => {
                let variant;

                if (account.email) {
                    if (account.password) {
                        variant = 0;
                    }
                    // Having no password assumes SSOGoogle
                    if (!account.password) {
                        variant = 1;
                    }
                    // A valid twitter.thx.network email assumes SSOTwitter
                    if (account.email.includes('@twitter.thx.network')) {
                        variant = 2;
                    }
                    // A valid spotify.thx.network email assumes SSOTwitter
                    if (account.email.includes('@spotify.thx.network')) {
                        variant = 3;
                    }
                } else {
                    variant = 4;
                }

                if (typeof variant === undefined) return;

                return accountsColl.updateOne({ _id: account._id }, { $set: { variant } });
            }),
        );
    },

    async down() {
        //
    },
};
