const { v4 } = require('uuid');
module.exports = {
  async up(db) {
    await db.collection('referralrewards').updateMany({token: null}, { $set: { token: v4() }});
  },

  async down() {
    //
  }
};