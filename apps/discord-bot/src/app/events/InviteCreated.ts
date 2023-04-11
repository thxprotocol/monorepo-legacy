import { Invite } from 'discord.js';
import { handleError } from '../commands/error';
import { TGatewayEvent } from '@thxnetwork/discord/types/TGatewayEvent';
import GatewayEventService from '../services/gateway-event.service';
import InviteService from '../services/invite.service';

const onInviteCreated = async (invite: Invite) => {
    try {
        console.log(invite);

        await InviteService.create({
            guildId: invite.guild.id,
            code: invite.code,
            inviterId: invite.inviter.id,
        });
        await GatewayEventService.create({
            guildId: invite.guild.id,
            name: 'inviteCreate',
            event: JSON.stringify(invite),
        } as TGatewayEvent);
    } catch (error) {
        handleError(error);
    }
};

export default onInviteCreated;
