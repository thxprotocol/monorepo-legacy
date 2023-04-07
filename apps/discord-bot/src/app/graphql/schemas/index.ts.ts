export const typeDefs = `#graphql
  type InviteUsed {
    _id: String,
    guildId: String,
    inviteId: String,
    userId: String,
    url: String,
  }

  type Query {
    invitesUsed(guildId:String, inviterId:String, url:String): [InviteUsed]
  }
`;
