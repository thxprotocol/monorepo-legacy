const { v4 } = require('uuid');
module.exports = {
  async up(db) {
    const collection = db.collection('pooltransfers');
    const poolTransfers = await (await collection.find({ uuid: { $exists: false } })).toArray();

    const promises = poolTransfers.map(async poolTransfer => {
      await collection.updateOne(
        { _id: poolTransfer._id },
        { $set: { uuid: v4() }, },
      );
      console.log('UPDATED', poolTransfer._id);
    })
    await Promise.all(promises);
  },

  async down() {
    //
  }
};
