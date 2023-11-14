import { Message } from 'discord.js';
import { logger } from '../util/logger';
import DiscordMessage from '../models/DiscordMessage';

const onMessageCreate = async (message: Message) => {
    try {
        logger.info(`#${message.author.id} created message ${message.id} in guild ${message.guild.id}`);

        const start = new Date();
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setUTCHours(23, 59, 59, 999);

        const dailyMessageCount = await DiscordMessage.countDocuments({
            guildId: message.guild.id,
            memberId: message.author.id,
            createdAt: { $gte: start, $lt: end },
        });

        if (dailyMessageCount < 10) {
            await DiscordMessage.create({
                guildId: message.guild.id,
                messageId: message.id,
                memberId: message.author.id,
            });
        }
    } catch (error) {
        logger.error(error);
    }
};

export default onMessageCreate;
