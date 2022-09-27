module.exports = {
    async up(db) {
        const erc20Coll = db.collection('assetpools');

        await erc20Coll.updateMany({ archived: {$eq: null} }, {$set: {archived: false}}, {
            multi: true,
        });
    },

    async down(db) {},
};
