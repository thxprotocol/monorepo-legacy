import { commands } from './commands/thx';
import { Client } from 'discord.js';
import { commandRegister } from '@thxnetwork/api/util/discord';
import { logger } from '@thxnetwork/api/util/logger';
import { handleError } from './commands/error';

const onClientReady = async (client: Client<true>) => {
    try {
        logger.info(`Ready! Logged in as ${client.user.tag}`);
        await commandRegister(commands);
    } catch (error) {
        handleError(error);
    }
};

export default onClientReady;
