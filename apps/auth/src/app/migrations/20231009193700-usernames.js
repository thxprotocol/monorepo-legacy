const { generateUsername } = require('unique-username-generator');

module.exports = {
    async up(db) {
        const accountColl = db.collection('accounts');
        for (const account of await await accountColl.find({}).toArray()) {
            const username = generateUsername('');
            await accountColl.updateOne({ _id: account._id }, { $set: { username } });
        }
    },

    async down() {
        //
    },
};
