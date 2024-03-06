export enum ERC721Variant {
    Unknown = -1,
    Default = 0,
    OpenSea = 1,
    Lottery = 2,
}

export enum ERC721TokenState {
    Pending = 0,
    Failed = 1,
    Minted = 2,
    Transferring = 3,
    Transferred = 4,
}
