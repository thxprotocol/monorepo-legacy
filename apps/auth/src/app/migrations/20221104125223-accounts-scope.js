module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const api = await clientColl.findOne({
            'payload.client_name': 'THX API',
        });

        await clientColl.updateOne(
            { _id: api._id },
            { $set: { 'payload.scope': 'openid accounts:read accounts:write' } },
        );
    },

    async down() {
        //
    },
};
