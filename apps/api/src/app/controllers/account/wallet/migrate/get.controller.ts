import { Request, Response } from 'express';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/types/enums';
import { Wallet } from '@thxnetwork/api/services/SafeService';
import { ERC20Token } from '@thxnetwork/api/models/ERC20Token';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import { logger } from 'ethers';
import { ERC721 } from '@thxnetwork/api/models/ERC721';
import ERC20 from '@thxnetwork/api/models/ERC20';
import BN from 'bn.js';

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
        logger.debug(`Attempted migration from ${req.auth.sub} for walletId "${thxWallet._id}"`);
    }

    const erc20Tokens = await ERC20Token.find({ walletId: String(thxWallet._id) });
    const erc721Tokens = await ERC721Token.find({ walletId: String(thxWallet._id) });
    res.json({
        wallet: thxWallet,
        erc20Tokens: (
            await Promise.all(
                erc20Tokens.map(async (token) => {
                    const erc20 = await ERC20.findById(token.erc20Id);
                    const balance = await erc20.contract.methods.balanceOf(thxWallet.address).call();
                    return { erc20, balance };
                }),
            )
        ).filter(({ balance }) => new BN(balance).gt(new BN(0))),
        erc721Tokens: (
            await Promise.all(
                erc721Tokens.map(async (token) => {
                    const erc721 = await ERC721.findById(token.erc721Id);
                    const owner = await erc721.contract.methods.ownerOf(token.tokenId).call();
                    return { owner, token };
                }),
            )
        ).filter(({ owner }) => owner === thxWallet.address),
    });
};

export default { controller, validation };
