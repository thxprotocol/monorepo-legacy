import { Client } from 'discord.js';
import commands from '../commands';
import commandRegister from '../utils/commandRegister';
import { logger } from '../utils/logger';
import { handleError } from '../commands/error';

const onClientReady = async (client: Client<true>) => {
    try {
        logger.info(`Ready! Logged in as ${client.user.tag}`);
        await commandRegister(Object.values(commands) as any);
    } catch (error) {
        handleError(error);
    }
};

export default onClientReady;
