import { Client } from 'discord.js';
import commands from '../commands';
import commandRegister from '../utils/commandRegister';

const onClientReady = async (client: Client<true>) => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    await commandRegister(Object.values(commands));
};

export default onClientReady;
