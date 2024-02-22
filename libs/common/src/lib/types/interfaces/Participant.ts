export type TParticipant = {
    _id: string;
    sub: string;
    poolId: string;
    rank: number;
    score: number;
    questEntryCount: number;
    balance: number;
    updatedAt: Date;
};
