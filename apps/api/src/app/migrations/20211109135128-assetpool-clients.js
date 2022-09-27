module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const ratColl = db.collection('registration_access_token');
        const assetpoolsColl = db.collection('assetpools');

        for (const pool of await assetpoolsColl.find().toArray()) {
            const rat = await ratColl.findOne({ _id: pool.rat });

            if (rat) {
                const clientData = {
                    sub: pool.sub,
                    clientId: rat.payload.clientId,
                    registrationAccessToken: rat.payload.jti,
                };
                const client = await clientColl.findOne(clientData);

                if (!client) {
                    await clientColl.insertOne(clientData);
                }

                await assetpoolsColl.updateOne(
                    { address: pool.address, network: pool.network },
                    { $unset: { rat: '' }, $set: { clientId: rat.payload.clientId } },
                );

                await clientColl.findOne({ 'payload.client_id': rat.payload.clientId });
            }
        }
    },

    async down() {
        //
    },
};
