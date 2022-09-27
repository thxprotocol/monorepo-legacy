const TokenFacetArtifact = require('@thxnetwork/artifacts/dist/exports/abis/ERC20ProxyFacet.json');
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
        const rewardsColl = db.collection('rewards');
        const erc20Coll = db.collection('erc20');
        const claimsColl = db.collection('claims');
        const assetPoolColl = db.collection('assetpools');
        const erc721Coll = db.collection('erc721');
        const erc721MetadataColl = db.collection('erc721metadata');

        const rewards = await rewardsColl.find().toArray();
        const promises = rewards.map(async (reward) => {
            try {
                const pool = await assetPoolColl.findOne({ _id: new ObjectId(reward.poolId) });
                if (!pool) throw new Error('No pool found for this reward.');
                const { web3 } = getProvider(pool.chainId);
                const poolContract = new web3.eth.Contract(TokenFacetArtifact, pool.address);

                let erc721, erc20;
                if (reward.erc721metadataId) {
                    const metadata = await erc721MetadataColl.findOne({ _id: new ObjectId(reward.erc721metadataId) });
                    if (!metadata) throw new Error('No metadata found for this reward.');
                    erc721 = await erc721Coll.findOne({ _id: new ObjectId(metadata.erc721) });
                    if (!erc721) throw new Error('No ERC721 found for this reward.');
                } else {
                    const tokenAddress = await poolContract.methods.getERC20().call();
                    erc20 = await erc20Coll.findOne({ address: tokenAddress, chainId: pool.chainId });
                    if (!erc20) throw new Error('No ERC20 found for this reward.');
                }

                const createdAt = new Date();
                const query = {
                    poolId: String(pool._id),
                    erc20Id: erc20 ? String(erc20._id) : undefined,
                    erc721Id: erc721 ? String(erc721._id) : undefined,
                    rewardId: String(reward.id),
                };
                const claim = await claimsColl.findOne(query);
                if (!claim) {
                    await claimsColl.insertOne({
                        ...query,
                        createdAt,
                        updatedAt: createdAt,
                    });
                }
            } catch (error) {
                console.log(error);
            }
        });

        await Promise.all(promises);
    },

    async down(db) {},
};
