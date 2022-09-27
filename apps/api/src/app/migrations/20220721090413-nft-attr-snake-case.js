const { snakeCase } = require('change-case');

module.exports = {
    async up(db) {
        const erc721metadataColl = db.collection('erc721metadata');
        for (const erc721metadata of await erc721metadataColl.find().toArray()) {
            if (erc721metadata.attributes) {
                const attributes = erc721metadata.attributes.map((attr) => {
                    attr.key = snakeCase(attr.key);
                    return attr;
                });
                await erc721metadataColl.updateOne({ _id: erc721metadata._id }, { $set: { attributes } });
            }
        }
    },

    async down() {
        //
    },
};
