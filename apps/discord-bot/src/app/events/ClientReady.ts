import { Client } from 'discord.js';
import commands from '../commands';
import commandRegister from '../utils/commandRegister';
import { logger } from '../utils/logger';

const onClientReady = async (client: Client<true>) => {
    logger.info(`Ready! Logged in as ${client.user.tag}`);
    await commandRegister(Object.values(commands) as any);
};

export default onClientReady;
