import { TokenGatingVariant } from '@thxnetwork/types/enums/TokenGatingVariant';
export type TTokenGating = {
    variant: TokenGatingVariant;
    contractAddress: string;
    amount?: number;
};
