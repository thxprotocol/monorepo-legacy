module.exports = {
    async up(db) {
        await db.collection('erc721').updateMany({}, { $set: { variant: 'erc721' } });
        await db
            .collection('erc721perks')
            .updateMany({}, { $rename: { erc721metadataId: 'metadataId', erc721tokenId: 'tokenId' } });
    },

    async down() {
        //
    },
};
