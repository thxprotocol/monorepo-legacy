const { snakeCase } = require('change-case');

module.exports = {
    async up(db) {
        const erc721Coll = db.collection('erc721');
        for (const erc721 of await erc721Coll.find().toArray()) {
            const properties = erc721.properties.map((prop) => {
                prop.name = snakeCase(prop.name);
                return prop;
            });
            await erc721Coll.updateOne({ _id: erc721._id }, { $set: { properties } });
        }
    },

    async down() {
        //
    },
};
