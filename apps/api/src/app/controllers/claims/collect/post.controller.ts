import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { RewardNFT, RewardNFTPayment, QRCodeEntry, ERC721Metadata } from '@thxnetwork/api/models';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import SafeService from '@thxnetwork/api/services/SafeService';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [param('uuid').isUUID(4), query('walletId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    let entry = await QRCodeEntry.findOne({ uuid: req.params.uuid });
    if (!entry) throw new BadRequestError('This claim URL is invalid.');
    // Can not be claimed when sub is set for this claim URL and claim amount is greater than 1
    if (entry.sub) throw new ForbiddenError('This NFT is claimed already.');

    const reward = await RewardNFT.findById(entry.rewardId);
    if (!reward) throw new BadRequestError('Reward not found');
    // Can be claimed only if point price is 0
    if (reward.pointPrice > 0) throw new ForbiddenError('Reward needs to be purchased with points.');

    const pool = await PoolService.getById(reward.poolId);
    if (!pool) throw new BadRequestError('Campaign not found.');

    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    if (!safe) throw new BadRequestError('Safe not found.');

    // Find wallet for the authenticated user
    const wallet = await WalletService.findById(req.query.walletId as string);
    if (!wallet) throw new NotFoundError('Wallet not found');

    // Mint an NFT token if the erc721 and metadata for the claim exists.
    const metadata = await ERC721Metadata.findById(reward.metadataId);
    if (!metadata) throw new NotFoundError('Metadata not found');

    const erc721 = await ERC721Service.findById(metadata.erc721Id);
    if (!erc721) throw new NotFoundError('ERC721 not found');

    // Mint the NFT
    const token = await ERC721Service.mint(safe, erc721, wallet, metadata);

    // Create a payment to register a completed claim.
    const payment = await RewardNFTPayment.create({
        sub: req.auth.sub,
        rewardId: reward._id,
        amount: reward.pointPrice,
        poolId: pool._id,
    });

    // Mark claim as claimed by setting sub
    entry = await QRCodeEntry.findByIdAndUpdate(entry._id, { sub: req.auth.sub, claimedAt: new Date() }, { new: true });

    return res.json({
        erc721,
        entry,
        payment,
        token,
        metadata,
        reward,
    });
};

export default { controller, validation };
