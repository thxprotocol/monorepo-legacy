const TokenFacetArtifact = require('@thxnetwork/artifacts/dist/exports/abis/ERC20ProxyFacet.json');
const Web3 = require('web3');

function getProvider(rpc) {
    const web3 = new Web3(rpc);
    const admin = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

    web3.eth.defaultAccount = admin.address;

    return { web3, admin };
}
const networks = [getProvider(process.env.TESTNET_RPC), getProvider(process.env.RPC)];

module.exports = {
    async up(db) {
        const membershipsColl = db.collection('membership');
        const assetpoolsColl = db.collection('assetpools');
        const erc20Coll = db.collection('erc20');
        const pools = await assetpoolsColl.find().toArray();
        const promises = pools.map(async (pool) => {
            try {
                const { web3, admin } = networks[pool.network];
                const contract = new web3.eth.Contract(TokenFacetArtifact, pool.address);
                const tokenAddress = await contract.methods.getToken().call({ from: admin.address });
                const erc20 = await erc20Coll.findOne({ network: pool.network, address: tokenAddress });

                await membershipsColl.updateMany(
                    { network: pool.network, poolAddress: pool.address },
                    { $set: { erc20: String(erc20._id) } },
                );
            } catch (error) {
                console.log(error);
            }
        });

        await Promise.all(promises);
    },

    async down(db) {
        await db.collection('membership').updateMany({}, { $unset: { erc20: null } });
    },
};
