type TQRCodeEntry = {
    sub?: string;
    uuid: string;
    poolId: string;
    redirectUrl: string;
    rewardUuid: string;
    amount: number;
    erc20Id?: string;
    erc721Id?: string;
    erc1155Id?: string;
    claimedAt?: Date;
    error?: string;
};
