export type TGatewayEvent = {
    guildId: string;
    name: string;
    event: string;
};

export type TGatewayEventUpdates = {
    guildId: string;
    name?: string;
    event?: string;
};
