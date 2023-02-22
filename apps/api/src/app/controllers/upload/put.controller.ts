import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import ImageService from '@thxnetwork/api/services/ImageService';
import { AccountPlanType } from '@thxnetwork/api/types/enums';
import { Request, Response } from 'express';
import IPFSService from '@thxnetwork/api/util/ipfs';

export default {
    controller: async (req: Request, res: Response) => {
        let ipfsUrl;
        const file = req.file;
        if (!file) return res.status(440).send('There no file to process');

        const account = await AccountProxy.getById(req.auth.sub);

        // if (req.body.ipfs && account.plan === AccountPlanType.Premium) {
        if (account.plan === AccountPlanType.Premium) {
            const result = await IPFSService.add(req.body.file);
            console.log(result);

            // const { data } = await IPFSService.get(result.data.Hash);
            // console.log(data);

            ipfsUrl = result.cid;
        }

        const response = await ImageService.upload(file);
        const publicUrl = ImageService.getPublicUrl(response.key);

        res.send({ publicUrl, ipfsUrl });
    },
};
