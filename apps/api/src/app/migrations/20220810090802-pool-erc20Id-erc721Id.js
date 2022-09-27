const ERC20ProxyFacetArtifact = require('@thxnetwork/artifacts/dist/exports/abis/ERC20ProxyFacet.json');
const ERC721ProxyFacetArtifact = require('@thxnetwork/artifacts/dist/exports/abis/ERC721ProxyFacet.json');
const Web3 = require('web3');
const { ObjectId } = require('mongodb');

const hardhat = new Web3(process.env.HARDHAT_RPC_TEST_OVERRIDE);
const hardhatAdmin = hardhat.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
hardhat.eth.defaultAccount = hardhatAdmin.address;

const testnet = new Web3(process.env.POLYGON_MUMBAI_RPC);
const testnetAdmin = testnet.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
testnet.eth.defaultAccount = testnetAdmin.address;

const mainnet = new Web3(process.env.POLYGON_RPC);
const mainnetAdmin = mainnet.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
mainnet.eth.defaultAccount = mainnetAdmin.address;

const ChainId = {
    Hardhat: 31337,
    PolygonMumbai: 80001,
    Polygon: 137,
};

const getProvider = (chainId) => {
    switch (chainId) {
        case ChainId.Hardhat:
            return { web3: hardhat, admin: hardhatAdmin };
        case ChainId.PolygonMumbai:
            return { web3: testnet, admin: testnetAdmin };
        case ChainId.Polygon:
            return { web3: mainnet, admin: mainnetAdmin };
    }
};

module.exports = {
    async up(db) {
        const erc20Coll = db.collection('erc20');
        const erc721Coll = db.collection('erc721');
        const poolsColl = db.collection('assetpools');
        const pools = await poolsColl.find().toArray();
        const promises = pools.map(async (pool) => {
            try {
                const { web3, admin } = getProvider(pool.chainId);

                if (pool.variant === 'defaultPool') {
                    const contract = new web3.eth.Contract(ERC20ProxyFacetArtifact, pool.address);
                    const address = await contract.methods.getERC20().call({ from: admin.address });
                    const erc20 = await erc20Coll.findOne({ address });

                    return await poolsColl.updateOne(
                        { _id: pool._id },
                        { $set: { erc20Id: String(erc20._id), variant: 'defaultDiamond' } },
                    );
                }

                if (pool.variant === 'nftPool') {
                    const contract = new web3.eth.Contract(ERC721ProxyFacetArtifact, pool.address);
                    const address = await contract.methods.getERC721().call({ from: admin.address });
                    const erc721 = await erc721Coll.findOne({ address });

                    return await poolsColl.updateOne(
                        { _id: pool._id },
                        { $set: { erc721Id: String(erc721._id), variant: 'defaultDiamond' } },
                    );
                }
            } catch (error) {
                console.error(error);
            }
        });
        await Promise.all(promises);
    },
    async down() {
        //
    },
};
