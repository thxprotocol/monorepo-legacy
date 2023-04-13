import { Request, Response } from 'express';
import { ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import type { TERC721, TERC721Token } from '@thxnetwork/api/types/TERC721';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { Wallet } from '@thxnetwork/api/services/WalletService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { query } from 'express-validator';

const validation = [query('chainId').exists().isNumeric()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']
    const wallet = await Wallet.findOne({ sub: req.auth.sub, chainId: Number(req.query.chainId) });
    if (!wallet) throw new NotFoundError('Could not find the wallet for the user');

    const tokens = await ERC721Service.findTokensByWallet(wallet);
    const result = await Promise.all(
        tokens.map(async (token: ERC721TokenDocument) => {
            const erc721 = await ERC721Service.findById(token.erc721Id);
            if (!erc721) return;
            if (erc721.chainId !== Number(req.query.chainId)) return { ...(token.toJSON() as TERC721Token), erc721 };

            const metadata = await ERC721Service.findMetadataById(token.metadataId);
            if (!metadata) return;

            const tokenUri = token.tokenId ? await erc721.contract.methods.tokenURI(token.tokenId).call() : '';
            erc721.logoImgUrl = erc721.logoImgUrl || `https://avatars.dicebear.com/api/identicon/${erc721.address}.svg`;

            return { ...(token.toJSON() as TERC721Token), metadata, tokenUri, erc721 };
        }),
    );

    res.json(
        result.reverse().filter((token: TERC721Token & { erc721: TERC721 }) => {
            if (!req.query.chainId) return true;
            return Number(req.query.chainId) === token.erc721.chainId;
        }),
    );
};

export default { controller, validation };
