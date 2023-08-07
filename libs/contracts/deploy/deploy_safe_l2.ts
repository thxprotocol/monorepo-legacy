import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { owner } = await getNamedAccounts();
    const { deploy } = deployments;

    await deploy('GnosisSafeL2', {
        from: owner,
        args: [],
        log: true,
        deterministicDeployment: true,
    });
};

deploy.tags = ['l2', 'l2-suite'];
export default deploy;
