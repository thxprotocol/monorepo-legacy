import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { owner } = await getNamedAccounts();
    const { deploy } = deployments;

    const bondContractAddress = '0x3b8E9B6047B9ea84Ea7E9758347F2fF15021c632';

    // const tx = await deploy('BondPurchaseChecker', {
    //     from: owner,
    //     args: [bondContractAddress],
    //     log: true,
    //     deterministicDeployment: true,
    // });

    await hre.run('verify:verify', {
        // address: tx.address,
        address: '0x4612E42a352E65457797188cCE0d4e8d2e0A2730',
        constructorArguments: [bondContractAddress],
    });
};

deploy.tags = ['bonds'];
export default deploy;
