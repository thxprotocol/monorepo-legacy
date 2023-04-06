import { Invite } from 'discord.js';
import { handleError } from '../commands/error';
import { TGatewayEvent } from '@thxnetwork/discord/types/TGatewayEvent';
import GatewayEventService from '../services/gateway-event.service';
import InviteService from '../services/invite.service';

const onInviteCreated = async (invite: Invite) => {
    try {
        await InviteService.create({
            guildId: invite.guild.id,
            code: invite.code,
            url: invite.url,
            inviterId: invite.inviter.id,
        });
        await GatewayEventService.create({
            guildId: invite.guild.id,
            event: invite,
            name: 'inviteCreate',
        } as TGatewayEvent);
    } catch (error) {
        handleError(error);
    }
};

export default onInviteCreated;
