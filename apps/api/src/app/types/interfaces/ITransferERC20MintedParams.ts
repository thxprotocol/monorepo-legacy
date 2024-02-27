import { ChainId } from '@thxnetwork/common/enums';

export interface ITransferERC20MintedParams {
    id: string;
    to: string;
    chainId: ChainId;
}
