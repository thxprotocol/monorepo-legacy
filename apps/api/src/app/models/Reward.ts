export const rewardSchema = {
    uuid: String,
    poolId: String,
    title: String,
    description: String,
    image: String,
    pointPrice: Number,
    expiryDate: Date,
    limit: Number,
    isPromoted: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    locks: { type: [{ questId: String, variant: Number }], default: [] },
    claimAmount: Number,
    claimLimit: Number,
};

export const rewardPaymentSchema = {
    poolId: String,
    rewardId: String,
    sub: String,
    amount: Number,
};
