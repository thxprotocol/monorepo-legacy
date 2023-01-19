import axios, { AxiosRequestConfig, Method } from 'axios';
import { MIXPANEL_API_URL } from '@thxnetwork/api/config/secrets';
import { Request, Response, Router } from 'express';

const router = Router();

const mixpanelProxy = function (options: AxiosRequestConfig) {
    axios.defaults.baseURL = MIXPANEL_API_URL;
    return axios(options);
};

router.all('*', async (req: Request, res: Response) => {
    await mixpanelProxy({
        method: req.method as Method,
        url: req.originalUrl.replace(req.baseUrl, ''),
        headers: { 'X-REAL-IP': req.ip },
        params: req.body,
    });
    res.end();
});

export default router;
