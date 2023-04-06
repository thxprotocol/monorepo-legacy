export type TGatewayEvent = {
    guildId: string;
    name: string;
    event: object;
};

export type TGatewayEventUpdates = {
    guildId: string;
    name?: string;
    event?: object;
};
