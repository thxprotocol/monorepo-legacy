type TRewardGalachain = TReward & {
    contract: TGalachainContract;
    token: TGalachainToken;
    amount: string;
    privateKey: string;
};
