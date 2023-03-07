module.exports = {
  async up(db) {
    await db.collection('accounts').updateMany(
      {},
      [{ $set: { email: { $toLower: "$email" } } }]
    )
  },
  async down() {
    //
  },
};