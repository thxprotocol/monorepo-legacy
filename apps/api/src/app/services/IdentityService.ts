import { AssetPoolDocument } from '../models/AssetPool';
import { Identity } from '../models/Identity';
import { uuidV1 } from '../util/uuid';

export default class IdentityService {
    // Derive uuid v1 from poolId + salt. Using uuid v1 format so we can
    // validate the input using express-validator
    static getIdentityForSalt(pool: AssetPoolDocument, salt: string) {
        const poolId = String(pool._id);
        const uuid = uuidV1(`${poolId}${salt}`);

        return Identity.findOneAndUpdate({ poolId, uuid }, { poolId, uuid }, { new: true, upsert: true });
    }
}
