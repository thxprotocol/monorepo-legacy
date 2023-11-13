import { Message } from 'discord.js';
import { logger } from '../util/logger';
import DiscordMessage from '../models/DiscordMessage';

const onMessageCreate = async (message: Message) => {
    try {
        logger.info(`#${message.author.id} created message ${message.id} in guild ${message.guild.id}`);
        await DiscordMessage.create({
            sub: String,
            guildId: String,
            messageId: String,
        });
    } catch (error) {
        logger.error(error);
    }
};

export default onMessageCreate;
