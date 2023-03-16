import { ChainId } from '@thxnetwork/types/enums';

export interface ITransferERC20MintedParams {
    id: string;
    to: string;
    chainId: ChainId;
}
