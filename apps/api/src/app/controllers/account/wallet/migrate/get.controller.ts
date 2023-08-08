import { Request, Response } from 'express';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/types/enums';
import { Wallet } from '@thxnetwork/api/services/SafeService';
import { ERC20Token } from '@thxnetwork/api/models/ERC20Token';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';

export const validation = [];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const chainId = NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat;
    // Find existing THX Smart Wallet so we can migrate assets
    const thxWallet = await Wallet.findOne({
        sub: req.auth.sub,
        chainId,
        version: '4.0.12',
        address: { $exists: true, $ne: '' },
        safeVersion: { $exists: false },
    });

    if (thxWallet) {
        console.debug(`Attempted migration from ${req.auth.sub} for walletId "${thxWallet._id}"`);
    }

    const erc20Tokens = await ERC20Token.find({ walletId: String(thxWallet._id) });
    const erc721Tokens = await ERC721Token.find({ walletId: String(thxWallet._id) });

    res.json({
        wallet: thxWallet,
        erc20Tokens,
        erc721Tokens,
    });
};

export default { controller, validation };
