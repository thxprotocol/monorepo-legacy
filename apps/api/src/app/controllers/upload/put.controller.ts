import { Request, Response } from 'express';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import ImageService from '@thxnetwork/api/services/ImageService';
import IPFSService from '@thxnetwork/api/util/ipfs';

export default {
    controller: async (req: Request, res: Response) => {
        const file = req.file;
        if (!file) return res.status(440).send('There no file to process');

        const account = await AccountProxy.getById(req.auth.sub);
        const response = await ImageService.upload(file);
        const publicUrl = ImageService.getPublicUrl(response.key);

        let ipfsUrl = 'https://ipfs.io/ipfs/';
        if (account.plan === AccountPlanType.Premium) {
            const result = await IPFSService.add(publicUrl);
            ipfsUrl += result.cid.toString();
        }

        res.send({ publicUrl, ipfsUrl });
    },
};
