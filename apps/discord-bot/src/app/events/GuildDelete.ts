import { Guild } from 'discord.js';
import { handleError } from '../commands/error';
import InviteService from '../services/invite.service';

const onGuildDelete = async (guild: Guild) => {
    try {
        await InviteService.delete({ guildId: guild.id });
        console.log('DELETED ALL INVITES!-----------------------------------------------');
    } catch (error) {
        handleError(error);
    }
};

export default onGuildDelete;
