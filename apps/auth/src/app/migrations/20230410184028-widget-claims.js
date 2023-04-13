module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const widgetClient = await clientColl.findOne({
            'payload.client_name': 'THX Widget',
        });
        const newScopes = 'claims:read';
        if (!widgetClient.payload.scope.includes(newScopes)) {
            await clientColl.updateOne(
                { _id: widgetClient._id },
                { $set: { 'payload.scope': widgetClient.payload.scope + ' ' + newScopes } },
            );
        }
    },

    async down() {
        //
    },
};
