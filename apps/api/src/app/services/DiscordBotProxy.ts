import { GraphQLClient } from 'graphql-request';
import { DISCORD_BOT_API_URL } from '../config/secrets';
import { BadRequestError, NotFoundError } from '../util/errors';
import DiscordDataProxy from '../proxies/DiscordDataProxy';
import { IAccount } from '../models/Account';

const client = new GraphQLClient(DISCORD_BOT_API_URL);

const getInvitesUsed = async (guildId: string, inviterId: string, url: string): Promise<{ _id: string }[]> => {
    const query = `#graphql
        query getInvitesUsed($guildId:String, $inviterId:String, $url:String) {
            invitesUsed(guildId: $guildId, inviterId: $inviterId, url:$url) {
                _id
            }
        }
        `;
    const data = (await client.request(query, { guildId, inviterId, url })) as { invitesUsed: { _id: string }[] };
    return data.invitesUsed;
};

const validateDiscordInviteUsed = async (account: IAccount, content: string) => {
    const { serverId, treshold, inviteURL } = JSON.parse(content);
    if (isNaN(Number(treshold))) {
        throw new BadRequestError('Invalid invite threshold');
    }
    const userId = await DiscordDataProxy.getUserId(account);
    if (!userId) {
        throw new NotFoundError('Could not find the Discord User');
    }
    const invitesUsed = await getInvitesUsed(serverId, userId, inviteURL);
    return invitesUsed.length >= treshold;
};

export default { getInvitesUsed, validateDiscordInviteUsed };
