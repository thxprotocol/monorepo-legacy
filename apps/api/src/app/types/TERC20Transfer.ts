import { ChainId } from '@thxnetwork/types/enums';

export type TERC20Transfer = {
    erc20: string;
    from: string;
    to: string;
    chainId: ChainId;
    transactionId: string;
    sub: string;
};
