type TParticipant = {
    _id: string;
    sub: string;
    poolId: string;
    rank: number;
    score: number;
    riskAnalysis: { score: number; reasons: string[] };
    questEntryCount: number;
    isSubscribed: boolean;
    balance: number;
    updatedAt: Date;
};
