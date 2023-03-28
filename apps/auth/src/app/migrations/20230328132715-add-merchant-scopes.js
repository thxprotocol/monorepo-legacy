module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const dashboardClient = await clientColl.findOne({
            'payload.client_name': 'THX Dashboard',
        });
        const newScopes = 'merchants:write merchants:read';
        if (!dashboardClient.payload.scope.includes(newScopes)) {
            await clientColl.updateOne(
                { _id: dashboardClient._id },
                { $set: { 'payload.scope': dashboardClient.payload.scope + ' ' + newScopes } },
            );
        }
    },

    async down() {
        //
    },
};
