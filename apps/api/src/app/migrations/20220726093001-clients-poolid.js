module.exports = {
    async up(db) {
        const clientsColl = db.collection('client');
        const poolsColl = db.collection('assetpools');
        const widgetsColl = db.collection('widget');
        const clients = await clientsColl.find().toArray();
        const promises = clients.map(async (client) => {
            try {
                const pool = await poolsColl.findOne({ clientId: client.clientId });
                if (pool) {
                    return await clientsColl.updateOne(
                        { _id: client._id },
                        { $set: { poolId: String(pool._id), grantType: 'client_credentials' } },
                    );
                }
                const widget = await widgetsColl.findOne({ clientId: client.clientId });
                if (widget) {
                    return await clientsColl.updateOne(
                        { _id: client._id },
                        { $set: { poolId: String(pool._id), grantType: 'authorization_code' } },
                    );
                }
            } catch (error) {
                console.error(error);
            }
        });
        await Promise.all(promises);
    },
    async down() {
        //
    },
};
