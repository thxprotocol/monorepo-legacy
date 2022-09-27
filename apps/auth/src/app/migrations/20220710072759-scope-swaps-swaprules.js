module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const wallet = await clientColl.findOne({
            'payload.client_name': 'THX Wallet',
        });
        const dashboard = await clientColl.findOne({
            'payload.client_name': 'THX Dashboard',
        });

        await clientColl.updateOne(
            { _id: wallet._id },
            { $set: { 'payload.scope': wallet.payload.scope + ' swaprule:read swap:read swap:write' } },
        );
        await clientColl.updateOne(
            { _id: dashboard._id },
            { $set: { 'payload.scope': dashboard.payload.scope + ' swaprule:read swaprule:write' } },
        );
    },

    async down() {
        //
    },
};
