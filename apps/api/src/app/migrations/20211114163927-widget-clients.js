module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const ratColl = db.collection('registration_access_token');
        const widgetColl = db.collection('widget');
        const assetpoolsColl = db.collection('assetpools');

        for (const widget of await widgetColl.find().toArray()) {
            const rat = await ratColl.findOne({ _id: widget.rat });

            if (rat) {
                const clientData = {
                    sub: widget.sub,
                    clientId: rat.payload.clientId,
                    registrationAccessToken: rat.payload.jti,
                };
                const client = await clientColl.findOne(clientData);

                if (!client) {
                    await clientColl.insertOne(clientData);
                }

                const pool = await assetpoolsColl.findOne({
                    address: widget.metadata ? widget.metadata.poolAddress : '',
                });

                if (pool) {
                    await widgetColl.updateOne(
                        { rat: rat.payload.jti },
                        {
                            $set: { clientId: rat.payload.clientId },
                            $unset: { rat: '' },
                        },
                    );
                } else {
                    await widgetColl.deleteOne({ rat: rat.payload.jti });
                }
            }
        }
    },

    async down() {
        //
    },
};
