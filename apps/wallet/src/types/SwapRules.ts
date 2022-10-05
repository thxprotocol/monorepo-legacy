export interface TSwapRule {
    _id: string;
    poolId: string;
    tokenInId: string;
    tokenMultiplier: number;
    page?: number;
}

export interface ISwapRules {
    [membershipId: string]: {
        [_id: string]: TSwapRule;
    };
}
