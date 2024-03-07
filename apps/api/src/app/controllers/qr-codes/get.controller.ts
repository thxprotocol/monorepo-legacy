import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import { QRCodeEntry, RewardNFT, ERC721Metadata } from '@thxnetwork/api/models';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('uuid').exists().isUUID(4)];

const controller = async (req: Request, res: Response) => {
    const entry = await QRCodeEntry.findOne({ uuid: req.params.uuid });
    if (!entry) throw new NotFoundError('QR code entry not found');

    const reward = await RewardNFT.findById(entry.rewardId);
    if (!reward) throw new NotFoundError('Reward not found');

    const pool = await PoolService.getById(reward.poolId);
    if (!pool) throw new NotFoundError('Pool not found');

    const erc721 = await ERC721Service.findById(reward.erc721Id);
    if (!erc721) throw new NotFoundError('ERC721 not found');

    const metadata = await ERC721Metadata.findById(reward.metadataId);
    if (!metadata) throw new NotFoundError('Metadata not found');

    return res.json({ pool, entry, erc721, metadata });
};

export default { controller, validation };
