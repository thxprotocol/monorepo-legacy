import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
declare global {
    namespace Express {
        interface Request {
            origin?: string;
            auth?: any;
            assetPool?: AssetPoolDocument;
        }
    }
}
