import mongoose from 'mongoose';
import { TERC20SwapRule } from '@thxnetwork/api/types/TERC20SwapRule';

export type ERC20SwapRuleDocument = mongoose.Document & TERC20SwapRule;

const ERC20SwapRuleSchema = new mongoose.Schema(
    {
        poolId: String,
        tokenInId: String,
        tokenMultiplier: Number,
    },
    { timestamps: true },
);

export const ERC20SwapRule = mongoose.model<ERC20SwapRuleDocument>(
    'ERC20SwapRule',
    ERC20SwapRuleSchema,
    'erc20swaprules',
);
