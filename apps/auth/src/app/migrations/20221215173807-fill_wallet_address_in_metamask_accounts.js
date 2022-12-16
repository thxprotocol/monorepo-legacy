module.exports = {
  async up(db) {
    // account variant 4 = Metamask
    const accountColl = db.collection('accounts');
    await accountColl.updateMany({ 'variant': 4, walletAddress: null }, [{
      "$set": { "walletAddress": "$address" }
    }]);
  },

  async down() {
    // 
  }
};
