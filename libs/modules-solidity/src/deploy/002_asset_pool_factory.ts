import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { diamond } = deployments;

    const { deployer } = await getNamedAccounts();

    await diamond.deploy('AssetPoolFactory', {
        from: deployer,
        log: true,
        facets: ['AssetPoolFactoryFacet'],
        execute: {
            methodName: 'setDefaultController',
            args: [deployer],
        },
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    return network.live; // Makes sure we don't redeploy on live networks
};
export default func;
func.id = '002_asset_pool_factory';
func.tags = ['AssetPoolFactory'];
