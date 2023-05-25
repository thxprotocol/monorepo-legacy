module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const client = await clientColl.findOne({
            'payload.client_name': 'THX Widget',
        });

        await clientColl.updateOne(
            { _id: client._id },
            { $set: { 'payload.scope': client.payload.scope + ' account:write' } },
        );
    },

    async down() {
        //
    },
};
