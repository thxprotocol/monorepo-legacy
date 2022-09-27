module.exports = {
    async up(db) {
        const erc20Coll = db.collection('erc721');

        await erc20Coll.updateMany({ archived: {$eq: null} }, {$set: {archived: false}}, {
            multi: true,
        });
    },

    async down(db) {},
};
