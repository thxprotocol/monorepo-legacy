import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import SafeService from '@thxnetwork/api/services/SafeService';
import WalletService from '@thxnetwork/api/services/WalletService';
import { Claim } from '@thxnetwork/api/models/Claim';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';

const validation = [param('uuid').isUUID(4), query('walletId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Claims']
    let claim = await ClaimService.findByUuid(req.params.uuid);
    if (!claim) throw new BadRequestError('This claim URL is invalid.');
    // Can not be claimed when sub is set for this claim URL and claim amount is greater than 1
    if (claim.sub) throw new ForbiddenError('This NFT is claimed already.');

    const pool = await PoolService.getById(claim.poolId);
    if (!pool) throw new BadRequestError('The pool for this claim URL has been removed.');

    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    if (!safe) throw new BadRequestError('Could not find campaign Safe.');

    const perk = await ERC721Perk.findOne({ uuid: claim.rewardUuid });
    if (!perk) throw new BadRequestError('The perk for this ID does not exist.');
    // Can be claimed only if point price is 0
    if (perk.pointPrice > 0) throw new ForbiddenError('This perk should be redeemed with points.');

    // Find wallet for the authenticated user
    const wallet = await WalletService.findById(req.query.walletId as string);
    if (!wallet) throw new NotFoundError('No wallet found for this user');

    // Mint an NFT token if the erc721 and metadata for the claim exists.
    const metadata = await ERC721Metadata.findById(perk.metadataId);
    if (!metadata) throw new NotFoundError('No metadata found for this claim URL');

    const erc721 = await ERC721Service.findById(metadata.erc721Id);
    if (!erc721) throw new NotFoundError('No erc721 found for this claim URL');

    // Mint the NFT
    const token = await ERC721Service.mint(safe, erc721, wallet, metadata);

    // Create a payment to register a completed claim.
    const payment = await ERC721PerkPayment.create({
        sub: req.auth.sub,
        perkId: perk._id,
        amount: perk.pointPrice,
        poolId: pool._id,
    });

    // Mark claim as claimed by setting sub
    claim = await Claim.findByIdAndUpdate(claim._id, { sub: req.auth.sub, claimedAt: new Date() }, { new: true });

    return res.json({
        erc721,
        claim,
        payment,
        token,
        metadata,
        reward: perk,
    });
};

export default { controller, validation };
