module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const client = await clientColl.findOne({
            'payload.client_name': 'THX Dashboard',
        });

        await clientColl.updateOne(
            { _id: client._id },
            { $set: { 'payload.scope': client.payload.scope + ' coupon_rewards:write coupon_rewards:read' } },
        );
    },

    async down() {
        //
    },
};
