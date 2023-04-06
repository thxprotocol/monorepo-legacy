import { Client, Guild, Invite } from 'discord.js';
import commands from '../commands';
import commandRegister from '../utils/commandRegister';
import { logger } from '../utils/logger';
import { handleError } from '../commands/error';
import { TGatewayEvent } from '@thxnetwork/discord/types/TGatewayEvent';
import { TInvite } from '@thxnetwork/discord/types/TInvite';
import GatewayEventService from '../services/gateway-event.service';
import InviteService from '../services/invite.service';

const onClientReady = async (client: Client<true>) => {
    try {
        logger.info(`Ready! Logged in as ${client.user.tag}`);
        await commandRegister(Object.values(commands) as any);

        // for await (const guild of client.guilds.cache) {
        //     await fetchInvites(guild[1]);
        // }

        client.on('inviteDelete', async (invite) => {
            await InviteService.delete({ guildId: invite.guild.id, code: invite.code });
        });

        client.on('inviteCreate', async (invite) => {
            await InviteService.create([mapInvite(invite)]);
            console.log('INVITE CREATED!-----------------------------------------------', invite);
            await GatewayEventService.create({
                guildId: invite.guild.id,
                event: invite,
                name: 'inviteCreate',
            } as TGatewayEvent);
        });
        // client.on('guildCreate', async (guild) => {
        //     // We've been added to a new Guild. Let's fetch all the invites, and save it to our cache
        //     await fetchInvites(guild);
        // });

        client.on('guildDelete', async (guild) => {
            // We've been removed from a Guild. Let's delete all their invites
            await InviteService.delete({ guildId: guild.id });
            console.log('DELETED ALL INVITES!-----------------------------------------------');
        });

        client.on('guildMemberAdd', async (member) => {
            const invites = await InviteService.list({ guildId: member.guild.id });
            if (!invites.length) {
                return;
            }
            console.log('MEMBER ADDED!-----------------------------------------------');
            console.log('INVITES', invites);
            // This is just to simplify the message being sent below (inviter doesn't have a tag property)
            //const inviter = await client.users.fetch(invite.inviter.id);

            // // A real basic message with the information we need.
            // inviter
            //     ? logger.info(
            //           `${member.user.tag} joined using invite code ${invite.code} from ${inviter.tag}. Invite was used ${invite.uses} times since its creation.`,
            //       )
            //     : logger.info(`${member.user.tag} joined but I couldn't find through which invite.`);
        });
    } catch (error) {
        handleError(error);
    }
};

async function fetchInvites(guild: Guild) {
    const invites = await guild.invites.fetch();
    console.log('invites', invites);
    if (invites) {
        await InviteService.create(
            invites.map((invite: Invite) => {
                return mapInvite(invite);
            }),
        );
    }
}

function mapInvite(invite: Invite): TInvite {
    return {
        guildId: invite.guild.id,
        code: invite.code,
        url: invite.url,
        inviterId: invite.inviter.id,
        uses: invite.uses,
    } as TInvite;
}

export default onClientReady;
