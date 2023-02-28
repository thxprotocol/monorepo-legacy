function getValue(attributes, key) {
    const attr = attributes.find((attr) => attr.key === key);
    return attr ? attr.value : '';
}

module.exports = {
    async up(db) {
        const metadataColl = db.collection('erc721metadata');
        const metadata = await (await metadataColl.find({})).toArray();

        await Promise.all(
            metadata.map(async (m) => {
                try {
                    await metadataColl.updateOne(
                        { _id: m._id },
                        {
                            $set: {
                                name: m.attributes ? getValue(m.attributes, 'name') : '',
                                description: m.attributes ? getValue(m.attributes, 'description') : '',
                                image: m.attributes ? getValue(m.attributes, 'image') : '',
                                imageUrl: m.attributes ? getValue(m.attributes, 'image') : '',
                                externalUrl: m.attributes ? getValue(m.attributes, 'externalUrl') : '',
                            },
                        },
                    );
                } catch (error) {
                    console.log(error);
                }
            }),
        );
        await metadataColl.updateMany({}, { $rename: { erc721: 'erc721Id' } });
    },

    async down() {
        //
    },
};
