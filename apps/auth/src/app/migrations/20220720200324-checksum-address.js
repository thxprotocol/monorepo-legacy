const { toChecksumAddress } = require('web3-utils');

module.exports = {
    async up(db) {
        const accountsColl = db.collection('accounts');
        const accounts = await accountsColl.find().toArray();

        await Promise.all(
            accounts.map((account) => {
                if (account.address) {
                    return accountsColl.updateOne(
                        { _id: account._id },
                        { $set: { address: toChecksumAddress(account.address) } },
                    );
                }
            }),
        );
    },

    async down() {
        //
    },
};
