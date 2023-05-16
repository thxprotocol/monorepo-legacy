module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const auth = await clientColl.findOne({
            'payload.client_name': 'THX Auth',
        });

        await clientColl.updateOne(
            { _id: auth._id },
            { $set: { 'payload.scope': auth.payload.scope + ' pools:read' } },
        );
    },

    async down() {
        //
    },
};
