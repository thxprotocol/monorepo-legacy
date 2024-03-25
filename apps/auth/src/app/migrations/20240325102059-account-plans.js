module.exports = {
    async up(db) {
        const accountColl = db.collection('accounts');

        // Change all existing Free (0) and Basic (1) plans to Lite (0) and also make all undefined plans Lite (0)
        await accountColl.updateOne(
            { $or: [{ plan: 0 }, { plan: 1 }, { plan: null }, { plan: { $exists: false } }] },
            { $set: { plan: 0 } },
        );

        // Change all existing Premium (2) plans to Premium (1)
        await accountColl.updateOne({ $or: [{ plan: 2 }] }, { $set: { plan: 1 } });
    },

    async down() {
        //
    },
};
