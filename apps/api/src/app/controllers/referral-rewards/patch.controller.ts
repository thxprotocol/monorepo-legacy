import { Request, Response } from 'express';
import { param } from 'express-validator';
import { QuestVariant } from '@thxnetwork/common/lib/types';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import ImageService from '@thxnetwork/api/services/ImageService';
import QuestService from '@thxnetwork/api/services/QuestService';
import QuestInviteCreate from './post.controller';

const validation = [param('id').isMongoId(), ...QuestInviteCreate.validation];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral']
    const {
        title,
        description,
        pathname,
        amount,
        successUrl,
        infoLinks,
        isMandatoryReview,
        index,
        isPublished,
        expiryDate,
        locks,
    } = req.body;
    const image = req.file && (await ImageService.upload(req.file));
    const quest = await QuestService.update(QuestVariant.Invite, req.params.id, {
        title,
        description,
        image,
        amount,
        pathname,
        successUrl,
        isMandatoryReview,
        infoLinks,
        index,
        isPublished,
        expiryDate,
        locks,
    });
    const claims = await ReferralRewardClaimService.findByReferralReward(quest);

    res.json({ ...quest.toJSON(), claims });
};

export default { controller, validation };
