module.exports = {
    async up(db) {
        const accountsColl = db.collection('accounts');
        await accountsColl.dropIndex({ email: 1 });
        await accountsColl.createIndex({ email: 1 }, { unique: true, sparse: true });
        await accountsColl.createIndex({ address: 1 }, { unique: true, sparse: true });
    },

    async down() {
        //
    },
};
