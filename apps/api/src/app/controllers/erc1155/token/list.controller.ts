import { Request, Response } from 'express';
import { ERC1155TokenDocument } from '@thxnetwork/api/models/ERC1155Token';
import type { TERC1155, TERC1155Token } from '@thxnetwork/api/types/TERC1155';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155']
    const tokens = await ERC1155Service.findTokensBySub(req.auth.sub);

    const result = await Promise.all(
        tokens.map(async (token: ERC1155TokenDocument) => {
            const erc1155 = await ERC1155Service.findById(token.erc1155Id);
            const baseURI = await erc1155.contract.methods.uri(1).call();
            if (!erc1155) return;
            if (erc1155.chainId !== Number(req.query.chainId)) return { ...(token.toJSON() as TERC1155Token), erc1155 };

            const tokenUri = token.tokenId ? baseURI.replace('{id}', token.tokenId) : '';
            erc1155.logoImgUrl =
                erc1155.logoImgUrl || `https://avatars.dicebear.com/api/identicon/${erc1155.address}.svg`;

            return { ...(token.toJSON() as TERC1155Token), tokenUri, erc1155 };
        }),
    );

    res.json(
        result.filter((token: TERC1155Token & { erc1155: TERC1155 }) => {
            if (!req.query.chainId) return true;
            return Number(req.query.chainId) === token.erc1155.chainId;
        }),
    );
};

export default { controller };
