import { ChainId } from '@thxnetwork/api/types/enums';

export interface ITransferERC20MintedParams {
    id: string;
    to: string;
    chainId: ChainId;
}
