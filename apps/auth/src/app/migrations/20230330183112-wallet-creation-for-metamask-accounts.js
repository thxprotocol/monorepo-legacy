const axios = require('axios');
const https = require('https');

const { API_URL, AUTH_URL, AUTH_CLIENT_ID, AUTH_CLIENT_SECRET } = process.env;
let apiAccessToken = '';
let apiAccessTokenExpired = 0;
const chainId = 137; // Polygon

module.exports = {
    async up(db) {
        const accounts = await (
            await db.collection('accounts').find({ variant: 4 }, { projection: { address: 1 } })
        ).toArray(); //metamask account variant

        const promises = accounts.map(async (account) => {
            try {
                const wallets = await getWallets(account._id);
                if (!wallets.length) {
                    await createWallet(account._id, account.address);
                    console.log(`Wallet created for sub ${account._id}`);
                } else {
                    console.log(`Wallet already present for sub: ${account._id}, skipped.`);
                }
            } catch (error) {
                console.log({ error });
            }
        });
        await Promise.all(promises);
    },

    async down() {
        //
    },
};

async function getWallets(sub) {
    const params = new URLSearchParams();
    params.set('chainId', String(chainId));
    params.set('sub', String(sub));

    const r = await apiClient({
        method: 'GET',
        url: '/v1/wallets',
        headers: {
            Authorization: await getAuthAccessToken(),
        },
        params,
    });
    return r.data;
}

async function createWallet(sub, address) {
    const r = await apiClient({
        method: 'POST',
        url: `/v1/wallets`,
        headers: {
            Authorization: await getAuthAccessToken(),
        },
        data: { sub, chainId, skipDeploy: true, address },
    });
    return r.data;
}

async function requestAuthAccessToken() {
    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');
    data.append('resource', API_URL);
    data.append('scope', 'openid brands:read claims:read wallets:read wallets:write pools:write');
    const r = await axios({
        baseURL: AUTH_URL,
        url: '/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${AUTH_CLIENT_ID}:${AUTH_CLIENT_SECRET}`).toString('base64'),
        },
        data,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    if (r.status !== 200) throw new Error('API access token request failed');
    return r.data;
}

async function getAuthAccessToken() {
    if (Date.now() > apiAccessTokenExpired) {
        const { access_token, expires_in } = await requestAuthAccessToken();
        apiAccessToken = access_token;
        apiAccessTokenExpired = Date.now() + expires_in * 1000;
    }
    return `Bearer ${apiAccessToken}`;
}

async function apiClient(config) {
    const authHeader = await getAuthAccessToken();
    if (!config.headers) config.headers = {};
    config.headers['Authorization'] = authHeader;
    config.baseURL = API_URL;
    config.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    return axios(config);
}
