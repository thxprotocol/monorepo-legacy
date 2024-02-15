import { AccountVariant, TAccount } from '@thxnetwork/common/lib/types';
import { AssetPoolDocument } from '../models/AssetPool';
import { Identity } from '../models/Identity';
import { uuidV1 } from '../util/uuid';

export default class IdentityService {
    static getUUID(pool: AssetPoolDocument, salt: string) {
        const poolId = String(pool._id);
        return uuidV1(`${poolId}${salt}`);
    }

    // Derive uuid v1 from poolId + salt. Using uuid v1 format so we can
    // validate the input using express-validator
    static getIdentityForSalt(pool: AssetPoolDocument, salt: string) {
        const uuid = this.getUUID(pool, salt);
        return Identity.findOneAndUpdate(
            { poolId: pool._id, uuid },
            { poolId: pool._id, uuid },
            { new: true, upsert: true },
        );
    }

    static async forceConnect(pool: AssetPoolDocument, account: TAccount) {
        if (account.variant !== AccountVariant.Metamask) return;
        const uuid = this.getUUID(pool, account.address);
        await Identity.findOneAndUpdate({ uuid }, { sub: account.sub });
    }
}
