module.exports = {
  async up(db) {
    const clientColl = db.collection('client');
    const wallet = await clientColl.findOne({
      'payload.client_name': 'THX Wallet',
    });
    const dashboard = await clientColl.findOne({
      'payload.client_name': 'THX Dashboard',
    });
    const api = await clientColl.findOne({
      'payload.client_name': 'THX API',
    });

    const widget = await clientColl.findOne({
      'payload.client_name': 'THX Widget',
    });

    await clientColl.updateOne(
      { _id: wallet._id },
      { $set: { 'payload.scope': wallet.payload.scope + ' erc1155:read' } },
    );
    await clientColl.updateOne(
      { _id: widget._id },
      { $set: { 'payload.scope': widget.payload.scope + ' erc1155:read' } },
    );
    await clientColl.updateOne(
      { _id: dashboard._id },
      { $set: { 'payload.scope': dashboard.payload.scope + ' erc1155:read erc1155:write' } },
    );
    await clientColl.updateOne({ _id: api._id }, { $set: { 'payload.scope': api.payload.scope + ' erc1155:read' } });
  },

  async down() {
    //
  },
};
