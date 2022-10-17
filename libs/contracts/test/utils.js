const { utils } = require('ethers/lib');
const { constants } = require('ethers');

FacetCutAction = {
    Add: 0,
    Replace: 1,
    Remove: 2,
};

const hex2a = (hex) => {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const v = parseInt(hex.substr(i, 2), 16);
        if (v == 8) continue; // http://www.fileformat.info/info/unicode/char/0008/index.htm
        if (v == 15) continue;
        if (v == 16) continue; // http://www.fileformat.info/info/unicode/char/0010/index.htm
        if (v == 14) continue; // https://www.fileformat.info/info/unicode/char/000e/index.htm
        if (v) str += String.fromCharCode(v);
    }
    return str.trim();
};

const helpSign = async (solution, name, args, account) => {
    nonce = await solution.getLatestNonce(account.address);
    nonce = parseInt(nonce) + 1;
    const call = solution.interface.encodeFunctionData(name, args);
    const hash = web3.utils.soliditySha3(call, nonce);
    const sig = await account.signMessage(ethers.utils.arrayify(hash));
    tx = await solution.call(call, nonce, sig);
    tx = await tx.wait();
    return tx;
};

const getDiamondCuts = async (facetContractNames) => {
    diamondCut = [];
    for (facetName of facetContractNames) {
        const contractfactory = await ethers.getContractFactory(facetName);
        const f = await contractfactory.deploy();
        diamondCut.push({
            action: FacetCutAction.Add,
            facetAddress: f.address,
            functionSelectors: getSelectors(f),
        });
    }
    return diamondCut;
};

const assetPool = async (deploy) => {
    tx = await deploy;
    tx = await tx.wait();
    const address = tx.events[tx.events.length - 1].args.assetPool;
    solution = await ethers.getContractAt('IDefaultDiamond', address);
    return solution;
};

const events = async (tx) => {
    tx = await tx;
    tx = await tx.wait();
    return tx.events;
};

const timestamp = async (tx) => {
    tx = await tx;
    tx = await tx.wait();
    return (await ethers.provider.getBlock(tx.blockNumber)).timestamp;
};

const getSelectors = function (contract) {
    const signatures = [];
    for (const key of Object.keys(contract.functions)) {
        signatures.push(utils.keccak256(utils.toUtf8Bytes(key)).substr(0, 10));
    }
    return signatures;
};

const diamond = async () => {
    factoryFacets = [
        await ethers.getContractFactory('AssetPoolFactoryFacet'),
        await ethers.getContractFactory('OwnershipFacet'),
    ];
    diamondCutFactory = [];
    for (let i = 0; i < factoryFacets.length; i++) {
        const f = await factoryFacets[i].deploy();
        diamondCutFactory.push({
            action: FacetCutAction.Add,
            facetAddress: f.address,
            functionSelectors: getSelectors(f),
        });
    }

    [owner] = await ethers.getSigners();
    const Diamond = await ethers.getContractFactory('Diamond');
    const diamond = await Diamond.deploy(diamondCutFactory, [await owner.getAddress()]);
    factory = await ethers.getContractAt('IDefaultFactory', diamond.address);
    await factory.setDefaultController(await owner.getAddress());

    return factory;
};

const createTokenFactory = async () => {
    factoryFacets = [await ethers.getContractFactory('TokenFactoryFacet')];
    diamondCutFactory = [];
    for (let i = 0; i < factoryFacets.length; i++) {
        const f = await factoryFacets[i].deploy();
        diamondCutFactory.push({
            action: FacetCutAction.Add,
            facetAddress: f.address,
            functionSelectors: getSelectors(f),
        });
    }

    [owner] = await ethers.getSigners();
    const Diamond = await ethers.getContractFactory('Diamond');
    const diamond = await Diamond.deploy(diamondCutFactory, [await owner.getAddress()]);
    return ethers.getContractAt('IDefaultTokenFactory', diamond.address);
};

const createPoolRegistry = async (feeCollector, feePercentage) => {
    factoryFacets = [await ethers.getContractFactory('PoolRegistryFacet')];
    diamondCuts = [];
    for (let i = 0; i < factoryFacets.length; i++) {
        const f = await factoryFacets[i].deploy();
        diamondCuts.push({
            action: FacetCutAction.Add,
            facetAddress: f.address,
            functionSelectors: getSelectors(f),
        });
    }

    [owner] = await ethers.getSigners();
    const Diamond = await ethers.getContractFactory('Diamond');
    const diamond = await Diamond.deploy(diamondCuts, [await owner.getAddress()]);
    const registry = await ethers.getContractAt('IDefaultPoolRegistry', diamond.address);
    await registry.initialize(feeCollector, feePercentage);
    return registry;
};

const limitedSupplyTokenContract = async (deploy) => {
    tx = await (await deploy).wait();
    const address = tx.events[tx.events.length - 1].args.token;
    return ethers.getContractAt('LimitedSupplyToken', address);
};

const unlimitedSupplyTokenContract = async (deploy) => {
    tx = await (await deploy).wait();
    const address = tx.events[tx.events.length - 1].args.token;
    return ethers.getContractAt('UnlimitedSupplyToken', address);
};

const nonFungibleTokenContract = async (deploy) => {
    tx = await (await deploy).wait();
    const address = tx.events[tx.events.length - 1].args.token;
    return ethers.getContractAt('NonFungibleToken', address);
};

const MEMBER_ROLE = '0x829b824e2329e205435d941c9f13baf578548505283d29261236d8e6596d4636';
const MANAGER_ROLE = '0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08';
const ADMIN_ROLE = constants.HashZero;
const ENABLE_REWARD = ethers.BigNumber.from('2').pow(250);
const DISABLE_REWARD = ethers.BigNumber.from('2').pow(251);

module.exports = {
    FacetCutAction,
    hex2a,
    helpSign,
    getDiamondCuts,
    assetPool,
    events,
    timestamp,
    getSelectors,
    diamond,
    createTokenFactory,
    createPoolRegistry,
    limitedSupplyTokenContract,
    unlimitedSupplyTokenContract,
    nonFungibleTokenContract,
    MEMBER_ROLE,
    MANAGER_ROLE,
    ADMIN_ROLE,
    ENABLE_REWARD,
    DISABLE_REWARD,
};
