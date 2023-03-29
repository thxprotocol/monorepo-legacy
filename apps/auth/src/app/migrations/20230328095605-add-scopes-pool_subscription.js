module.exports = {
  async up(db) {
    const clientColl = db.collection('client');

    const dashboard = await clientColl.findOne({
      'payload.client_name': 'THX Dashboard',
    });

    const widget = await clientColl.findOne({
      'payload.client_name': 'THX Widget',
    });


    await clientColl.updateOne(
      { _id: dashboard._id },
      { $set: { 'payload.scope': dashboard.payload.scope + ' pool_subscription:read' } },
    );

    await clientColl.updateOne(
      { _id: widget._id },
      { $set: { 'payload.scope': widget.payload.scope + ' pool_subscription:read pool_subscription:write' } },
    );
  },

  async down() {
    //
  },
};
