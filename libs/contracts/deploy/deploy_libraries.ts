import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { owner } = await getNamedAccounts();
    const { deploy } = deployments;

    await deploy('CreateCall', {
        from: owner,
        args: [],
        log: true,
        deterministicDeployment: true,
    });

    await deploy('MultiSend', {
        from: owner,
        args: [],
        log: true,
        deterministicDeployment: true,
    });

    await deploy('MultiSendCallOnly', {
        from: owner,
        args: [],
        log: true,
        deterministicDeployment: true,
    });

    await deploy('SignMessageLib', {
        from: owner,
        args: [],
        log: true,
        deterministicDeployment: true,
    });
};

deploy.tags = ['libraries', 'l2-suite', 'main-suite'];
export default deploy;
