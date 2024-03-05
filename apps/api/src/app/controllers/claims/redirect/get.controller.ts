import { Request, Response } from 'express';
import { param } from 'express-validator';
import { RewardNFT, QRCodeEntry } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';
import { WIDGET_URL } from '@thxnetwork/api/config/secrets';

const validation = [param('uuid').isUUID(4)];

const controller = async (req: Request, res: Response) => {
    const entry = await QRCodeEntry.findOne({ uuid: req.params.uuid });
    if (!entry) throw new NotFoundError('QR code entry not found');

    const reward = await RewardNFT.findById(entry.rewardId);
    if (!reward) throw new NotFoundError('Reward not found');

    // If redirectURL is set in entry, redirect immediately
    if (entry.redirectURL) {
        const url = new URL(entry.redirectURL);
        url.searchParams.append('thx_widget_path', `/c/${req.params.uuid}`);

        return res.redirect(302, url.toString());
    }

    // Redirect to campaign URl if not present in the entry
    const pool = await PoolService.getById(reward.poolId);
    if (!pool) throw new NotFoundError('Pool not found.');

    const url = new URL(WIDGET_URL);
    url.pathname = `/c/${pool.settings.slug}/c/${req.params.uuid}`;

    return res.redirect(302, url.toString());
};

export default { controller, validation };
