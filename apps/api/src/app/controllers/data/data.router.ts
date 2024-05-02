import axios, { AxiosRequestConfig, Method } from 'axios';
import { MIXPANEL_API_URL } from '@thxnetwork/api/config/secrets';
import { Request, Response, Router } from 'express';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
// import { getIP } from '@thxnetwork/api/util/ip';

const router = Router();

const mixpanelProxy = function (options: AxiosRequestConfig) {
    if (!options.url.startsWith('/')) throw new ForbiddenError();
    axios.defaults.baseURL = MIXPANEL_API_URL;
    return axios(options);
};

router.all('*', async (req: Request, res: Response) => {
    // if (req.body.data) {
    //     const dataDecoded = Buffer.from(req.body.data, 'base64').toString();
    //     const dataObject = JSON.parse(dataDecoded);
    //     const data = dataObject.map((item) => {
    //         if (!item || !item.event) return item;
    //         return { properties: { ...item.properties, real_ip: getIP(req) } };
    //     });
    //     const dataString = JSON.stringify(data);
    //     req.body.data = Buffer.from(dataString).toString('base64');
    // }
    await mixpanelProxy({
        method: req.method as Method,
        url: req.originalUrl.replace(req.baseUrl, ''),
        headers: { 'X-REAL-IP': req.ip },
        params: req.body,
    });
    res.end();
});

export default router;
