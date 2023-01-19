import { Client } from 'discord.js';

const onClientReady = (client: Client<true>) => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
};

export default onClientReady;
