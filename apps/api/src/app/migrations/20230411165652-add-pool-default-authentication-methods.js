module.exports = {
  //   enum AccountVariant {
  //     EmailPassword = 0,
  //     SSOGoogle = 1,
  //     SSOTwitter = 2,
  //     SSOSpotify = 3, // @dev Deprecated
  //     Metamask = 4,
  //     SSOGithub = 5,
  //     SSODiscord = 6,

  //     SSOTwitch = 7,
  //  }

  async up(db) {
    const authenticationMethods = [0, 1, 2, 4, 5, 6, 7];
    await db.collection('assetpools').updateMany({ 'settings.authenticationMethods': null }, { $set: { 'settings.authenticationMethods': authenticationMethods } });
  },

  async down(db, client) {
    //
  },
};
