export type TInvite = {
    guildId: string;
    inviterId: string;
    code: string;
    url: string;
    createdAt?: Date;
};

export type TInviteUpdates = {
    guildId: string;
    inviterId?: string;
    code?: string;
    url?: string;
};
