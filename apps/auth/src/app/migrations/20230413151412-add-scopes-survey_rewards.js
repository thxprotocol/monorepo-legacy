module.exports = {
  async up(db) {
    const clientColl = db.collection('client');

    const dashboard = await clientColl.findOne({
      'payload.client_name': 'THX Dashboard',
    });
    const api = await clientColl.findOne({
      'payload.client_name': 'THX API',
    });
    const auth = await clientColl.findOne({
      'payload.client_name': 'THX Auth',
    });

    await clientColl.updateOne(
      { _id: dashboard._id },
      { $set: { 'payload.scope': dashboard.payload.scope + ' survey_rewards:read survey_rewards:write' } },
    );
    await clientColl.updateOne(
      { _id: api._id },
      { $set: { 'payload.scope': api.payload.scope + ' survey_rewards:read survey_rewards:write' } },
    );
    await clientColl.updateOne(
      { _id: auth._id },
      { $set: { 'payload.scope': auth.payload.scope + ' survey_rewards:read' } },
    );

  },

  async down() {
    //
  },
};
