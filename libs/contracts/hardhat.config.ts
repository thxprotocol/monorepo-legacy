const dotenv = require('dotenv');
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-web3');
require('hardhat-gas-reporter');
require('hardhat-deploy');

dotenv.config();

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || '';
const POLYGON_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY || '';
const POLYGON_PRIVATE_KEY_DEV = process.env.POLYGON_PRIVATE_KEY_DEV || '';

const config: any = {
    defaultNetwork: 'hardhat',
    solidity: {
        compilers: [
            {
                version: '0.7.6',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: '0.8.0',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: '0.8.6',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        collector: {
            default: '0x960911a62FdDf7BA84D0d3aD016EF7D15966F7Dc',
        },
    },
    networks: {
        hardhat: {
            accounts: [
                {
                    balance: '100000000000000000000',
                    privateKey: '873c254263b17925b686f971d7724267710895f1585bb0533db8e693a2af32ff',
                },
                {
                    balance: '100000000000000000000',
                    privateKey: '0x97093724e1748ebfa6aa2d2ec4ec68df8678423ab9a12eb2d27ddc74e35e5db9',
                },
                {
                    balance: '100000000000000000000',
                    privateKey: '5a05e38394194379795422d2e8c1d33e90033d90defec4880174c39198f707e3',
                },
                {
                    balance: '100000000000000000000',
                    privateKey: 'eea0247bd059ac4d2528adb36bb0de003d62ba568e3197984b61c41d9a132df0',
                },
            ],
        },
        fork: {
            url: `http://127.0.0.1:8545/`,
            accounts: ['eea0247bd059ac4d2528adb36bb0de003d62ba568e3197984b61c41d9a132df0'],
            timeout: 2483647,
        },
    },
    paths: {
        sources: 'src/contracts',
    },
    gasReporter: {
        token: 'MATIC',
        currency: 'USD',
        gasPriceApi: 'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice',
        enabled: process.env.REPORT_GAS ? true : false,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        maxMethodDiff: 10,
    },
};

if (POLYGON_PRIVATE_KEY && INFURA_PROJECT_ID) {
    config.networks.mumbai = {
        url: `https://polygon-mumbai.infura.io/v3/${INFURA_PROJECT_ID}`,
        accounts: [POLYGON_PRIVATE_KEY],
        timeout: 2483647,
    };
    config.networks.matic = {
        url: `https://polygon-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        accounts: [POLYGON_PRIVATE_KEY],
        timeout: 2483647,
    };
}
if (POLYGON_PRIVATE_KEY_DEV && INFURA_PROJECT_ID) {
    config.networks.mumbaidev = {
        url: `https://polygon-mumbai.infura.io/v3/${INFURA_PROJECT_ID}`,
        accounts: [POLYGON_PRIVATE_KEY_DEV],
        timeout: 2483647,
    };
    config.networks.maticdev = {
        url: `https://polygon-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        accounts: [POLYGON_PRIVATE_KEY_DEV],
        timeout: 2483647,
    };
}

if (process.env.ETHERSCAN_API) {
    config.etherscan = {
        apiKey: process.env.ETHERSCAN_API,
    };
}

module.exports = config;
