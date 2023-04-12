const chainId = 137; // Polygon
module.exports = {
  async up(db) {
    const tokenCollections = ['erc20token', 'erc721token', 'erc1155token', 'withdrawals'];
    const walletColl = db.collection('wallets');
    const promises = [];
    for (const coll of tokenCollections) {
      const collection = db.collection(coll);
      const items = await (await collection.find({ walletId: { $exists: false } })).toArray();
      promises.push(items.map(async item => {
        const wallets = await (await walletColl.find({ sub: item.sub, chainId })).toArray();
        if (wallets.length) {
          const walletId = String(wallets[0]._id);
          await collection.updateOne({ _id: item._id }, { $set: { walletId } });
          console.log(`UPDATED token ${item._id} of ${coll}, with walletId: ${walletId} for sub: ${item.sub}`);
        }
      }));
    }
    await Promise.all(promises);
  },

  async down() {
    //
  }
};
