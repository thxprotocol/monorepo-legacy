import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { owner } = await getNamedAccounts();
    const { deploy } = deployments;

    await deploy('DefaultCallbackHandler', {
        from: owner,
        args: [],
        log: true,
        deterministicDeployment: true,
    });

    await deploy('CompatibilityFallbackHandler', {
        from: owner,
        args: [],
        log: true,
        deterministicDeployment: true,
    });
};

deploy.tags = ['handlers', 'l2-suite', 'main-suite'];
export default deploy;
