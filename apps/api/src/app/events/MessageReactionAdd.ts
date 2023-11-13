import { MessageReaction } from 'discord.js';
import { logger } from '../util/logger';

const onInteractionCreated = async (interaction: MessageReaction) => {
    try {
        console.log(interaction);
    } catch (error) {
        logger.error(error);
    }
};

export default onInteractionCreated;
