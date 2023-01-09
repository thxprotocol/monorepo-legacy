const { v4 } = require('uuid');
module.exports = {
  async up(db) {
    const coll = db.collection('referralrewards');
    const rewards = await (await coll.find({token: null})).toArray(); 
    const promises = rewards.map(async (reward) => {
      await coll.updateOne(
        { _id: reward._id },
        { $set: { token: v4() }} ,
      );
    })
    await Promise.all(promises);
  },

  async down() {
    //
  }
};