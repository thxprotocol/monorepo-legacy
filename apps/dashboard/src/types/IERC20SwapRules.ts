import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import type { IPool } from '@thxnetwork/dashboard/store/modules/pools';

export type TERC20SwapRule = {
  _id: string;
  chainId: ChainId;
  poolAddress: string;
  tokenInAddress: string;
  tokenMultiplier: number;
  tokenInId: string;
  page: number;
  createdAt: Date;
};

export interface GetERC20SwapRulesProps {
  pool: IPool;
  page?: number;
  limit?: number;
}

export interface GetERC20SwapRulesResponse {
  results: TERC20SwapRule[];
  next?: { page: number };
  previous?: { page: number };
  limit?: number;
  total: number;
}

export type IERC20SwapRuleByPage = { [id: string]: TERC20SwapRule };

export interface IERC20SwapRules {
  [poolId: string]: { [id: string]: TERC20SwapRule };
}
