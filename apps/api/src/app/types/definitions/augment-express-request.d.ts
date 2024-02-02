import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { TQuest } from '@thxnetwork/common/lib/types';
declare global {
    namespace Express {
        interface Request {
            origin?: string;
            auth?: any;
            rawBody?: string;
            account?: TAccount;
            wallet: WalletDocument;
            campaign?: AssetPoolDocument;
            quest?: TQuest;
        }
    }
}
