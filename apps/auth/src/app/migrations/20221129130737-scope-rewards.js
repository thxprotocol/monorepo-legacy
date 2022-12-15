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

        await clientColl.updateOne(
            { _id: wallet._id },
            { $set: { 'payload.scope': wallet.payload.scope + ' point_rewards:read point_balances:read erc20_rewards:read erc721_rewards:read referral_rewards:read' } },
        );
        await clientColl.updateOne(
            { _id: dashboard._id },
            { $set: { 'payload.scope': dashboard.payload.scope + ' point_rewards:read point_balances:read erc20_rewards:read erc20_rewards:write erc721_rewards:read erc721_rewards:write referral_rewards:read referral_rewards:write' } },
        );
        await clientColl.updateOne(
            { _id: api._id },
            { $set: { 'payload.scope': api.payload.scope + ' point_rewards:read point_balances:read point_rewards:write point_balances:write erc20_rewards:read erc20_rewards:write erc721_rewards:read erc721_rewards:write referral_rewards:read referral_rewards:write' } },
        );
        await clientColl.updateOne(
            { _id: auth._id },
            { $set: { 'payload.scope': auth.payload.scope + ' point_rewards:read point_balances:read' } },
        );
        
    },

    async down() {
        //
    },
};
