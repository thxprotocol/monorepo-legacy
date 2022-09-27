import { SwapState } from './enums/SwapState';

export type TERC20Swap = {
    swapRuleId: string;
    state: SwapState;
    amountIn: string;
    amountOut: string;
    transactions: string[];
};
