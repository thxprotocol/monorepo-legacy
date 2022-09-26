module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const wallet = await clientColl.findOne({
            'payload.client_name': 'THX Wallet',
        });
        const dashboard = await clientColl.findOne({
            'payload.client_name': 'THX Dashboard',
        });
        const api = await clientColl.findOne({
            'payload.client_name': 'THX API',
        });

        await clientColl.updateOne(
            { _id: wallet._id },
            { $set: { 'payload.scope': wallet.payload.scope + ' claims:read' } },
        );
        await clientColl.updateOne(
            { _id: dashboard._id },
            { $set: { 'payload.scope': dashboard.payload.scope + ' claims:read' } },
        );
        await clientColl.updateOne({ _id: api._id }, { $set: { 'payload.scope': api.payload.scope + ' claims:read' } });
    },

    async down() {
        //
    },
};
