import { TAccount, WalletVariant } from '@thxnetwork/common/lib/types';
import { AssetPoolDocument } from '../models/AssetPool';
import { Identity } from '../models/Identity';
import { uuidV1 } from '../util/uuid';
import { Wallet } from '../models/Wallet';

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
        // Search for WalletConnect wallets for this sub
        const wallets = await Wallet.find({ sub: account.sub, variant: WalletVariant.WalletConnect });
        if (!wallets.length) return;

        // Create a list of uuids for these wallets
        const uuids = wallets.map((wallet) => this.getUUID(pool, wallet.address));

        // Find any identity for these uuids and update
        await Identity.findOneAndUpdate({ uuid: { $in: uuids } }, { sub: account.sub });
    }
}
