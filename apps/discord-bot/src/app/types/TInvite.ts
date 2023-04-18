export type TInvite = {
    guildId: string;
    inviterId: string;
    code: string;
    uses: number;
    createdAt?: Date;
};
