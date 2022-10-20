import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ContractName } from 'exports';

const facets: ContractName[] = [
    'FactoryFacet',
    'RegistryFacet',
    'AccessControlFacet',
    'RegistryProxyFacet',
    'ERC20ProxyFacet',
    'ERC20DepositFacet',
    'ERC20WithdrawFacet',
    'ERC20SwapFacet',
    'ERC721ProxyFacet',
    'DiamondCutFacet',
    'DiamondLoupeFacet',
    'OwnershipFacet',
];
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;

    const { owner } = await getNamedAccounts();

    for (const facet of facets) {
        await deploy(facet, {
            from: owner,
            args: [],
            log: true,
            autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
            waitConfirmations: network.live ? 3 : 0,
        });
    }
};
export default func;
func.tags = facets;
