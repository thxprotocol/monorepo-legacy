import { ChatInputCommandInteraction } from 'discord.js';
import router from '../commands';

const onInteractionCreated = (interaction: ChatInputCommandInteraction) => {
    try {
        return router[interaction.commandName].executor(interaction);
    } catch {}
};

export default onInteractionCreated;
