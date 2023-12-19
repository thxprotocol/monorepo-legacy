import jwt_decode from 'jwt-decode';
import { Request, Response } from 'express';
import { PointReward, PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';
import { Web3QuestClaim } from '@thxnetwork/api/models/Web3QuestClaim';
import { TBaseReward } from '@thxnetwork/types/interfaces';
import { Event } from '@thxnetwork/api/models/Event';
import { Identity, IdentityDocument } from '@thxnetwork/api/models/Identity';
import PoolService from '@thxnetwork/api/services/PoolService';
import DailyRewardClaimService, { ONE_DAY_MS } from '@thxnetwork/api/services/DailyRewardClaimService';
import WalletService from '@thxnetwork/api/services/WalletService';
import DailyRewardService from '@thxnetwork/api/services/DailyRewardService';
import PointRewardService from '@thxnetwork/api/services/PointRewardService';

const getDefaults = ({ _id, index, title, description, infoLinks, uuid, image, expiryDate }: TBaseReward) => ({
    _id,
    index,
    title,
    description,
    infoLinks,
    image,
    uuid,
    expiryDate,
});

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const query = {
        poolId: pool._id,
        isPublished: true,
        $or: [
            { expiryDate: { $exists: true, $gte: new Date() } }, // Include rewards with expiryDate less than or equal to now
            { expiryDate: { $exists: false } }, // Include quests with no expiryDate
        ],
    };
    const authHeader = req.header('authorization');
    const models = [ReferralReward, PointReward, MilestoneReward, DailyReward, Web3Quest];
    const [inviteQuests, socialQuests, customQuests, dailyQuests, web3Quests] = await Promise.all(
        models.map(async (model: any) => await model.find(query)),
    );

    let wallet: WalletDocument, sub: string, identity: IdentityDocument;

    // This endpoint is public so we do not get req.auth populated and decode the token ourselves
    // when the request is made with an authorization header to obtain the sub.
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token: { sub: string } = jwt_decode(authHeader.split(' ')[1]);
        sub = token.sub;
        wallet = await WalletService.findPrimary(sub, pool.chainId);
        identity = await Identity.findOne({ poolId: pool._id, sub });
    }

    const dailyQuestPromises = dailyQuests.map(async (r) => {
        const isDisabled = wallet ? !(await DailyRewardClaimService.isClaimable(r, wallet)) : true;
        const validClaims = wallet ? await DailyRewardClaimService.findByWallet(r, wallet) : [];
        const claimAgainTime = validClaims.length ? new Date(validClaims[0].createdAt).getTime() + ONE_DAY_MS : null;
        const now = Date.now();
        const defaults = getDefaults(r);
        const pointsAvailable = await DailyRewardService.getPointsAvailable(r, validClaims);

        return {
            ...defaults,
            amounts: r.amounts,
            pointsAvailable,
            isDisabled,
            claims: validClaims,
            claimAgainDuration:
                claimAgainTime && claimAgainTime - now > 0 ? Math.floor((claimAgainTime - now) / 1000) : null, // Convert and floor to S,
        };
    });
    const customQuestPromises = customQuests.map(async (r) => {
        const defaults = getDefaults(r);
        const claims = wallet
            ? await MilestoneRewardClaim.find({
                  walletId: String(wallet._id),
                  milestoneRewardId: String(r._id),
                  isClaimed: true,
              })
            : [];
        const events = identity ? await Event.find({ name: r.eventName, identityId: String(identity._id) }) : [];
        const pointsAvailable = (r.limit - claims.length) * r.amount;

        return {
            ...defaults,
            limit: r.limit,
            amount: r.amount,
            pointsAvailable,
            claims,
            events,
        };
    });
    const inviteQuestPromises = inviteQuests.map((r) => {
        const defaults = getDefaults(r);
        return {
            ...defaults,
            amount: r.amount,
            pointsAvailable: r.amount,
            pathname: r.pathname,
            successUrl: r.successUrl,
        };
    });

    const web3QuestPromises = web3Quests.map(async (r) => {
        const isClaimed = wallet
            ? await Web3QuestClaim.exists({
                  web3QuestId: r._id,
                  $or: [{ sub }, { walletId: wallet._id }],
              })
            : false;
        const defaults = getDefaults(r);
        return {
            ...defaults,
            amount: r.amount,
            pointsAvailable: r.amount,
            contracts: r.contracts,
            methodName: r.methodName,
            threshold: r.threshold,
            isClaimed,
        };
    });

    const [daily, custom, invite, web3] = await Promise.all([
        await Promise.all(dailyQuestPromises),
        await Promise.all(customQuestPromises),
        await Promise.all(inviteQuestPromises),
        await Promise.all(web3QuestPromises),
    ]);

    res.json({
        daily,
        custom,
        invite,
        social: socialQuests.map((q: PointRewardDocument) => ({
            ...getDefaults(q),
            amount: q.amount,
            platform: q.platform,
            interaction: q.interaction,
            content: q.content,
            contentMetadata: q.contentMetadata,
            pointsAvailable: q.amount,
            restartDates: PointRewardService.getRestartDates(q),
        })),
        web3,
    });
};

export default { controller };
