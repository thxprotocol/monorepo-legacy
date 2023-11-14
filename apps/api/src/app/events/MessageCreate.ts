import { Message } from 'discord.js';
import { logger } from '../util/logger';
import DiscordMessage from '../models/DiscordMessage';

const onMessageCreate = async (message: Message) => {
    try {
        logger.info(`#${message.author.id} created message ${message.id} in guild ${message.guild.id}`);
        await DiscordMessage.create({
            guildId: message.guild.id,
            messageId: message.id,
            memberId: message.author.id,
        });
    } catch (error) {
        logger.error(error);
    }
};

export default onMessageCreate;
