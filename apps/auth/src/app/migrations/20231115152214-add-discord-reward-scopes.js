module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const client = await clientColl.findOne({
            'payload.client_name': 'THX Dashboard',
        });

        await clientColl.updateOne(
            { _id: client._id },
            {
                $set: {
                    'payload.scope': client.payload.scope + ' discord_role_rewards:write discord_role_rewards:read',
                },
            },
        );
    },

    async down() {
        //
    },
};
