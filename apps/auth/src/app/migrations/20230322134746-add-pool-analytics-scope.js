module.exports = {
  async up(db) {
    const clientColl = db.collection('client');

    const discordClient = await clientColl.findOne({
      'payload.client_name': 'THX Discord',
    });
    if (!discordClient) {
      console.log('THX Discord Client not found.');
      return;
    }
    await clientColl.updateOne(
      { _id: discordClient._id },
      { $set: { 'payload.scope': discordClient.payload.scope + ' pool_analytics:read' } },
    );

  },

  async down() {
    //
  },
};
