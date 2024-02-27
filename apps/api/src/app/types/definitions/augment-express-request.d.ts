import { PoolDocument } from '@thxnetwork/api/models/AssetPool';
import { TQuest } from '@thxnetwork/common/lib/types';
declare global {
    namespace Express {
        interface Request {
            origin?: string;
            auth?: any;
            rawBody?: string;
            account?: TAccount;
            campaign?: PoolDocument;
            quest?: TQuest;
        }
    }
}
