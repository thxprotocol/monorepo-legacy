import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ShopifyPerk } from '@thxnetwork/api/models/ShopifyPerk';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import PointBalanceService, { PointBalance } from '@thxnetwork/api/services/PointBalanceService';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import ShopifyDataProxy from '@thxnetwork/api/proxies/ShopifyDataProxy';
import { ShopifyPerkPayment } from '@thxnetwork/api/models/ShopifyPerkPayment';
import { ShopifyDiscountCode } from '@thxnetwork/api/models/ShopifyDiscountCode';
import { generateRandomString } from '@thxnetwork/api/util/random';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import PerkService from '@thxnetwork/api/services/PerkService';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks Payment']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const perk = await ShopifyPerk.findOne({ uuid: req.params.uuid });
    if (!perk) throw new NotFoundError('Could not find this perk');
    if (!perk.pointPrice) throw new NotFoundError('No point price for this perk has been set.');

    const wallet = await Wallet.findOne({ sub: req.auth.sub, chainId: pool.chainId });
    const pointBalance = await PointBalance.findOne({ wallet: wallet._id, poolId: pool._id });
    if (!pointBalance || Number(pointBalance.balance) < Number(perk.pointPrice)) {
        throw new BadRequestError('Not enough points on this account for this perk.');
    }

    const redeemValidationResult = await PerkService.validate({ perk, sub: req.auth.sub, pool });
    if (redeemValidationResult.isError) {
        throw new ForbiddenError(redeemValidationResult.errorMessage);
    }
    const account = await AccountProxy.getById(req.auth.sub);
    const poolAccount = await AccountProxy.getById(pool.sub);
    const discountCode = await ShopifyDataProxy.createDiscountCode(
        poolAccount,
        perk.priceRuleId,
        perk.discountCode + '#' + generateRandomString(5).toUpperCase(),
    );
    await ShopifyDiscountCode.create({
        sub: account.sub,
        poolId: pool._id,
        shopifyPerkId: perk._id,
        discountCodeId: discountCode.id,
        priceRuleId: discountCode.price_rule_id,
        code: discountCode.code,
    });
    const shopifyPerkPayment = await ShopifyPerkPayment.create({
        perkId: perk._id,
        sub: req.auth.sub,
        walletId: wallet._id,
        poolId: pool._id,
        amount: perk.pointPrice,
    });

    await PointBalanceService.subtract(pool, wallet._id, perk.pointPrice);

    res.status(201).json({ discountCode, shopifyPerkPayment });
};

export default { controller, validation };
