import { Request, Response } from 'express';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import { INFURA_IPFS_BASE_URL } from '@thxnetwork/api/config/secrets';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import ImageService from '@thxnetwork/api/services/ImageService';
import IPFSService from '@thxnetwork/api/services/IPFSService';

export default {
    controller: async (req: Request, res: Response) => {
        if (!req.file) return res.status(440).send('There no file to process');
        const account = await AccountProxy.getById(req.auth.sub);

        let publicUrl;
        if (account.plan === AccountPlanType.Premium) {
            const result = await IPFSService.add(req.file);
            publicUrl = INFURA_IPFS_BASE_URL + result.cid.toString();
        } else {
            const result = await ImageService.upload(req.file);
            publicUrl = ImageService.getPublicUrl(result.key);
        }

        res.send({ publicUrl });
    },
};
