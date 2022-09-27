const TokenFacetArtifact = require('@thxnetwork/artifacts/dist/exports/abis/ERC20ProxyFacet.json');
const ERC20Artifact = require('@thxnetwork/artifacts/dist/exports/abis/ERC20.json');
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
        const assetpoolsColl = db.collection('assetpools');
        const erc20Coll = db.collection('erc20');
        const pools = await assetpoolsColl.find().toArray();
        const promises = pools.map(async (pool) => {
            try {
                const { web3, admin } = networks[pool.network];
                const contract = new web3.eth.Contract(TokenFacetArtifact, pool.address);
                const tokenAddress = await contract.methods.getToken().call({ from: admin.address });
                const tokenContract = new web3.eth.Contract(ERC20Artifact, tokenAddress);
                const poolBalance = Number(await contract.methods.getBalance().call());

                return await erc20Coll.insertOne({
                    name: await tokenContract.methods.name().call(),
                    symbol: await tokenContract.methods.symbol().call(),
                    address: tokenAddress,
                    // Assuming that pools with > 0 balance have an LimitedSupplyToken configured since
                    // the supply would be minted into the pool
                    type: poolBalance > 0 ? 0 : 1,
                    network: pool.network,
                    sub: pool.sub,
                    createdAt: pool.createdAt,
                    updatedAt: pool.updatedAt,
                });
            } catch (error) {
                console.log(error);
            }
        });

        await Promise.all(promises);
    },

    async down(db) {
        await db.collection('erc20').deleteMany({});
    },
};
