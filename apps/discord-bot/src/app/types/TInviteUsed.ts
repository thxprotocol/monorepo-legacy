export type TInviteUsed = {
    guildId: string;
    inviteId: string;
    url: string;
    inviterId: string;
    userId: string;
};

export type TInviteUsedUpdates = {
    guildId?: string;
    inviteId?: string;
    url?: string;
    inviterId?: string;
    userId?: string;
};
