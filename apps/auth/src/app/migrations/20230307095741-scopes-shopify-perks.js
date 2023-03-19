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
        const auth = await clientColl.findOne({
            'payload.client_name': 'THX Auth',
        });
        const widget = await clientColl.findOne({
            'payload.client_name': 'THX Widget',
        });

        await clientColl.updateOne(
            { _id: wallet._id },
            { $set: { 'payload.scope': wallet.payload.scope + ' shopify_rewards:read' } },
        );
        await clientColl.updateOne(
            { _id: dashboard._id },
            { $set: { 'payload.scope': dashboard.payload.scope + ' shopify_rewards:read shopify_rewards:write' } },
        );
        await clientColl.updateOne(
            { _id: api._id },
            { $set: { 'payload.scope': api.payload.scope + ' shopify_rewards:read shopify_rewards:write' } },
        );
        await clientColl.updateOne(
            { _id: auth._id },
            { $set: { 'payload.scope': auth.payload.scope + ' shopify_rewards:read' } },
        );
        await clientColl.updateOne(
            { _id: widget._id },
            { $set: { 'payload.scope': widget.payload.scope + ' shopify_rewards:read' } },
        );
    },

    async down() {
        //
    },
};
