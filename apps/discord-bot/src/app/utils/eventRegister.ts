import { Client } from 'discord.js';

const eventRegister = (client: Client<true>, router: { [key: string]: any }) => {
    Object.keys(router).forEach((key) => {
        client.on(key, router[key]);
    });
};

export default eventRegister;
