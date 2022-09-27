import mongoose from 'mongoose';
import { TERC20Swap } from '@thxnetwork/api/types/TERC20Swap';

export type ERC20SwapDocument = mongoose.Document & TERC20Swap;

const ERC20SwapSchema = new mongoose.Schema(
    {
        swapRuleId: String,
        state: Number,
        amountIn: String,
        amountOut: String,
        transactions: [String],
    },
    { timestamps: true },
);

export const ERC20Swap = mongoose.model<ERC20SwapDocument>('ERC20Swap', ERC20SwapSchema, 'erc20swaps');
