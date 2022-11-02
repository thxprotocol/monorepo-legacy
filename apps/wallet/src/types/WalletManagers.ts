export interface TWalletManager {
    _id: string;
    walletId: string;
    address: string;
}

export interface IWalletManagers {
    [walletId: string]: {
        [_id: string]: TWalletManager;
    };
}
