module.exports = {
  async up(db) {
    await db.collection('erc20perks').updateMany({}, { $rename: { 'rewardLimit': 'limit' } });
    await db.collection('erc721perks').updateMany({}, { $rename: { 'rewardLimit': 'limit' } });
    await db.collection('erc1155perks').updateMany({}, { $rename: { 'rewardLimit': 'limit' } });
  },

  async down() {
    //
  }
};
