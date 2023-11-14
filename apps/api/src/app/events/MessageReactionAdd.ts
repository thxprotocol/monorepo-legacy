import { MessageReaction } from 'discord.js';
import { logger } from '../util/logger';
import DiscordReaction from '../models/DiscordReaction';

const onInteractionCreated = async (reaction: MessageReaction) => {
    try {
        console.log(reaction);
        const users = await reaction.users.fetch();
        const promises = users.map((user) => {
            try {
                logger.info(
                    `#${user.id} created a reaction on message ${reaction.message.id} in guild ${reaction.message.guild.id}`,
                );
                return DiscordReaction.create({
                    guildId: reaction.message.guild.id,
                    messageId: reaction.message.id,
                    memberId: user.id,
                    content: reaction['_emoji'].name,
                });
            } catch (error) {
                logger.error(error);
            }
        });
        await Promise.all(promises);
    } catch (error) {
        logger.error(error);
    }
};

export default onInteractionCreated;
