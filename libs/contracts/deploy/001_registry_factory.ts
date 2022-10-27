import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { BigNumber } from 'ethers';

const multiplier = BigNumber.from('10').pow(15);
const twoHalfPercent = BigNumber.from('25').mul(multiplier);

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { diamond } = deployments;
    const { owner, collector } = await getNamedAccounts();

    const registry = await diamond.deploy('Registry', {
        from: owner,
        log: true,
        facets: ['RegistryFacet'],
        execute: {
            methodName: 'initialize',
            args: [collector, twoHalfPercent],
        },
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    await diamond.deploy('Factory', {
        from: owner,
        log: true,
        facets: ['FactoryFacet'],
        execute: {
            methodName: 'initialize',
            args: [owner, registry.address],
        },
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    return network.live; // Makes sure we don't redeploy on live networks
};
export default func;
func.id = '001_registry_factory';
func.tags = ['Registry', 'Factory'];
