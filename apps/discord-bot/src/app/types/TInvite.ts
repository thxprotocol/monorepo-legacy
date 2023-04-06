export type TInvite = {
    guildId: string;
    inviterId: string;
    code: string;
    uses: number;
    url: string;
};

export type TInviteUpdates = {
    guildId: string;
    inviterId?: string;
    code?: string;
    uses?: number;
    url?: string;
};
