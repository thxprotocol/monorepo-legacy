import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { IAccessToken } from '@thxnetwork/auth/types/TAccount';
import { BadRequestError, NotFoundError } from '@thxnetwork/auth/util/errors';
import { Request, Response } from 'express';
import { AccountService } from '../../../services/AccountService';
import { ShopifyService } from '@thxnetwork/auth/services/ShopifyService';

export const getShopifyPurchase = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const token: IAccessToken | undefined = account.getToken(AccessTokenKind.Shopify);
    if (!token) {
        throw new NotFoundError();
    }
    const amount = Number(req.query.amount);
    if (isNaN(amount)) {
        throw new BadRequestError('Invalid purchase amount');
    }
    const result = await ShopifyService.validatePurchase(
        token.accessToken,
        account.shopifyStoreUrl,
        account.email,
        amount.toString(),
    );

    res.json({
        result,
    });
};
