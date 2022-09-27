const axios = require('axios');
module.exports = {
    async up(db, client) {
        const POLYGON_CHAIN_ID = 137
        const QUICKSWAP_TOKEN_LIST =
            'https://unpkg.com/quickswap-default-token-list@1.2.40/build/quickswap-default.tokenlist.json';
        
        const result = await axios({
            method: 'GET',
            url: QUICKSWAP_TOKEN_LIST,
            withCredentials: false,
        });
        
        const erc20Coll = db.collection('erc20');

        await Promise.all(
          result.data.tokens.map((x) => {
                try {
                    erc20Coll.updateOne(
                        { address: x.address, chainId: POLYGON_CHAIN_ID },
                        { $set: { logoImgUrl: x.logoURI } },
                    );
                } catch (error) {
                    console.error(error);
                }
            }),
        );
    },

    async down(db, client) {},
};
