const axios = require('axios');
const https = require('https');

const { API_URL, AUTH_URL, AUTH_CLIENT_ID, AUTH_CLIENT_SECRET } = process.env;
let apiAccessToken = '';
let apiAccessTokenExpired = 0;
const chainId = 137; // Polygon

module.exports = {
    async up(db) {
        // Query for Metamask AccountVariant
        const accounts = await (await db.collection('accounts').find({ variant: 4 })).toArray();
        for (const account of accounts) {
            try {
                if (!account.address) continue;
                const wallets = await getWallets(account.address);
                if (!wallets.length) await createWallet(account);
            } catch (error) {
                console.log({ error });
            }
        }
    },
    async down() {
        //
    },
};

async function getWallets(address) {
    const params = new URLSearchParams();
    params.set('chainId', chainId);
    params.set('address', address);

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

async function createWallet(account) {
    const r = await apiClient({
        method: 'POST',
        url: `/v1/wallets`,
        headers: {
            Authorization: await getAuthAccessToken(),
        },
        data: { sub: String(account._id), chainId, address: account.address },
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
