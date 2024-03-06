import { WalletVariant } from '@thxnetwork/common/enums';
import { Wallet, Identity, PoolDocument } from '@thxnetwork/api/models';
import { uuidV1 } from '../util/uuid';

export default class IdentityService {
    static getUUID(pool: PoolDocument, salt: string) {
        const poolId = String(pool._id);
        return uuidV1(`${poolId}${salt}`);
    }

    // Derive uuid v1 from poolId + salt. Using uuid v1 format so we can
    // validate the input using express-validator
    static getIdentityForSalt(pool: PoolDocument, salt: string) {
        const uuid = this.getUUID(pool, salt);
        return Identity.findOneAndUpdate(
            { poolId: pool._id, uuid },
            { poolId: pool._id, uuid },
            { new: true, upsert: true },
        );
    }

    static async forceConnect(pool: PoolDocument, account: TAccount) {
        // Search for WalletConnect wallets for this sub
        const wallets = await Wallet.find({ sub: account.sub, variant: WalletVariant.WalletConnect });
        if (!wallets.length) return;

        // Create a list of uuids for these wallets
        const uuids = wallets.map((wallet) => this.getUUID(pool, wallet.address));

        // Find any identity for these uuids and update
        await Identity.findOneAndUpdate({ uuid: { $in: uuids } }, { sub: account.sub });
    }
}
