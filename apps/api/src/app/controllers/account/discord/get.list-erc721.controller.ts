import { Request, Response } from 'express';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import { TERC721, TERC721Token } from '@thxnetwork/api/types/TERC721';

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    const { sub } = req.params;
    const tokens = await ERC721Service.findTokensBySub(sub);
    const result = await Promise.all(
        tokens.map(async (token: ERC721TokenDocument) => {
            const erc721 = await ERC721Service.findById(token.erc721Id);
            const tokenUri = token.tokenId ? await erc721.contract.methods.tokenURI(token.tokenId).call() : '';
            erc721.logoImgUrl = erc721.logoImgUrl || `https://avatars.dicebear.com/api/identicon/${erc721.address}.svg`;

            return { ...(token.toJSON() as TERC721Token), tokenUri, erc721 };
        }),
    );

    res.json(
        result.filter((token: TERC721Token & { erc721: TERC721 }) => {
            if (!req.query.chainId) return true;
            return Number(req.query.chainId) === token.erc721.chainId;
        }),
    );
};

export default { controller };
