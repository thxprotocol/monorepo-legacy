module.exports = {
  async up(db) {
    await db.collection('assetpools').updateMany({title: null}, { $set: { 'title': 'My Loyalty Pool'} });
  },

  async down() {
    //
  }
};
