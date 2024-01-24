import { commands } from './commands/thx';
import { Client } from 'discord.js';
import { commandRegister } from '@thxnetwork/api/util/discord';
import { logger } from '@thxnetwork/api/util/logger';

const onClientReady = async (client: Client<true>) => {
    logger.info(`Ready! Logged in as ${client.user.tag}`);
    await commandRegister(commands);
};

export default onClientReady;
