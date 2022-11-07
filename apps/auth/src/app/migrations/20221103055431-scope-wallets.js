module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const wallet = await clientColl.findOne({
            'payload.client_name': 'THX Wallet',
        });
        const auth = await clientColl.findOne({
            'payload.client_name': 'THX Auth',
        });

        await clientColl.updateOne(
            { _id: wallet._id },
            { $set: { 'payload.scope': wallet.payload.scope + ' wallets:read wallets:write' } },
        );
        await clientColl.updateOne(
            { _id: auth._id },
            { $set: { 'payload.scope': auth.payload.scope + ' wallets:read wallets:write' } },
        );
    },

    async down() {
        //
    },
};
