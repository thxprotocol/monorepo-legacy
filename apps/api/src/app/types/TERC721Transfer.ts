import { ChainId } from '@thxnetwork/types/enums';

export type TERC721Transfer = {
    erc721Id: string;
    erc721TokenId: string;
    from: string;
    to: string;
    chainId: ChainId;
    transactionId: string;
    sub: string;
};
