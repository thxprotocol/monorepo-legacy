const axios = require('axios');

require('dotenv').config();

async function getAuthAccessToken() {
    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');
    data.append('scope', 'openid account:read account:write');

    const r = await axios({
        url: `${process.env.AUTH_URL}/token`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization':
                'Basic ' +
                Buffer.from(`${process.env.AUTH_CLIENT_ID}:${process.env.AUTH_CLIENT_SECRET}`).toString('base64'),
        },
        data,
    });

    if (r.status === 200) {
        return r.data.access_token;
    }
}

module.exports = {
    async up(db) {
        return true; // Without the auth server running this breaks on local. Prod and dev have been migrated so commenting this out is fine..
        const authAccessToken = await getAuthAccessToken();
        const withdrawalsColl = db.collection('withdrawals');

        for (const beneficiary of await withdrawalsColl.distinct('beneficiary')) {
            try {
                const r = await axios({
                    method: 'GET',
                    url: `${process.env.AUTH_URL}/account/address/${beneficiary}`,
                    headers: {
                        Authorization: `Bearer ${authAccessToken}`,
                    },
                });
                await withdrawalsColl.updateMany({ beneficiary }, { $set: { sub: r.data.id } });
            } catch (error) {
                console.log(error);
            }
        }
    },

    async down(db) {
        await db.collection('withdrawals').updateMany({}, { $unset: { sub: null } });
    },
};
