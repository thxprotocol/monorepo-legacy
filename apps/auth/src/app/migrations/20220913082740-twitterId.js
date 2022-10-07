module.exports = {
  async up(db, client) {
    const accountsColl = db.collection('accounts');
    const accounts = await accountsColl.find({email: /@twitter.thx.network$/}).toArray();
        await Promise.all(
            accounts.map((account) => {
              const twitterId = account.email.split('@twitter.thx.network')[0];
              accountsColl.updateOne({ _id: account._id }, { $set: { twitterId } });
            }))
    
  },
};
