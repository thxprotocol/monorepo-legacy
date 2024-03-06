import { MessageReaction } from 'discord.js';
import { logger } from '../util/logger';
import { DiscordReaction } from '@thxnetwork/api/models';

const onMessageReactionAdd = async (reaction: MessageReaction) => {
    try {
        const users = await reaction.users.fetch();
        const promises = users.map((user) => {
            try {
                // logger.info(
                //     `#${user.id} created a reaction on message ${reaction.message.id} in guild ${reaction.message.guild.id}`,
                // );
                const filter = {
                    guildId: reaction.message.guild.id,
                    messageId: reaction.message.id,
                    memberId: user.id,
                };
                return DiscordReaction.findOneAndUpdate(
                    filter,
                    { ...filter, content: reaction['_emoji'].name },
                    { upsert: true },
                );
            } catch (error) {
                logger.error(error);
            }
        });
        await Promise.all(promises);
    } catch (error) {
        logger.error(error);
    }
};

export default onMessageReactionAdd;
