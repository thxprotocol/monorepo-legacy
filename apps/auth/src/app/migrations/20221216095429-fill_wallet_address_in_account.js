
const axios = require('axios');
const {Agent} = require('https');
module.exports = {
  async up(db) {
    
    let params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('resource', process.env.API_URL);
    params.append('scope', 'openid brands:read claims:read wallets:read wallets:write');
    const httpsAgent = new Agent({
      rejectUnauthorized: false,
    });
    const r = await axios({
        baseURL: process.env.AUTH_URL,
        url: '/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${process.env.AUTH_CLIENT_ID}:${process.env.AUTH_CLIENT_SECRET}`).toString('base64'),
        },
        data:params,
        httpsAgent
    });
    if (r.status === 200) {
      const {access_token } = r.data;
      // account variant 4 = Metamask
      const accountColl = db.collection('accounts');
      const accountsToUpdate = await (accountColl.find({walletAddress:null, variant:{$ne:4}})).toArray();
      console.log('accountsToUpdate:', accountsToUpdate.length);
      let accountsUpdated = 0;
      const promises = accountsToUpdate.map(async (account) => {
        const {data} = await axios({
            url: `${process.env.API_URL}/v1/wallets?sub=${String(account._id)}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            httpsAgent,
          });
          if(data.length) {
            const {address} = data[0];
            await accountColl.updateOne(
              { _id: account._id },
              { $set: { 'walletAddress': address } },
            );
            accountsUpdated++;
          }
      });
      await Promise.all(promises)
      console.log('accountsUpdated:', accountsUpdated);
    }
  },

  async down() {
    // 
  }
};
