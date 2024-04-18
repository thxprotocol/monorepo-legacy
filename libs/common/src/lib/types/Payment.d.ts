type TPayment = {
    _id: string;
    poolId: string;
    sub: string;
    createdAt: Date;
};

type JoinPoolAttributes = {
    to: string;
    data: string;
    minBPTOut: string;
    attributes: { joinPoolRequest: JoinPoolRequest };
};

type JoinPoolRequest = {
    assets: string[];
    maxAmountsIn: string[];
    userData: string;
    fromInternalBalance: boolean;
};
