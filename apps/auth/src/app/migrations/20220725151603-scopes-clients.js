module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const dashboard = await clientColl.findOne({
            'payload.client_name': 'THX Dashboard',
        });

        await clientColl.updateOne(
            { _id: dashboard._id },
            { $set: { 'payload.scope': dashboard.payload.scope + ' clients:read clients:write' } },
        );
    },

    async down() {
        //
    },
};
