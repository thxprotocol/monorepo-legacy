export const rewardBaseSchema = {
    uuid: String,
    poolId: String,
    title: String,
    description: String,
    expiryDate: Date,
    claimAmount: Number,
    rewardLimit: Number,
    isClaimOnce: Boolean,
    platform: Number,
    interaction: Number,
    content: String,
};
