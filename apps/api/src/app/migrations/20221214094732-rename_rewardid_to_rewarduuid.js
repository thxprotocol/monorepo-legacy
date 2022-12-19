module.exports = {
  async up(db) {
    await db.collection('claims').updateMany({ }, { $rename: { 'rewardId': 'rewardUuid', 'id':'uuid'} });
    await db.collection('widget').updateMany({ }, { $rename: { 'metadata.rewardId': 'metadata.rewardUuid'} });
  },

  async down() {
    //
  }
};
