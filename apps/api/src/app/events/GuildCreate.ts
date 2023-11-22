import { Guild, MessagePayload } from 'discord.js';
import { logger } from '@thxnetwork/api/util/logger';
import { handleError } from './commands/error';
import { createSelectMenuConnectCampaign } from './components';
import AccountProxy from '../proxies/AccountProxy';

const onGuildCreate = async (guild: Guild) => {
    logger.info(`Added to guild: ${guild.name}`);
    try {
        const member = await guild.members.fetch(guild.ownerId);
        const account = await AccountProxy.getByDiscordId(guild.ownerId);
        if (!account) return;

        const row = await createSelectMenuConnectCampaign(account, guild);
        await member.send({
            content:
                'THX for the invite!🙏 Please connect your Quest & Reward campaign or ask the campaign owner to run `/thx connect` in your server.',
            components: [row as any],
        });
    } catch (error) {
        handleError(error);
    }
};

export default onGuildCreate;
