import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { parseUnits } from 'ethers/lib/utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;

    const { owner } = await getNamedAccounts();

    await deploy('UnlimitedSupplyToken', {
        from: owner,
        args: ['80THX-20USDC', '80THX-20USDC', owner],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    await deploy('LimitedSupplyToken', {
        from: owner,
        args: ['THX Limited Supply Token', 'LIM-THX', owner, parseUnits('100000000', 'ether')],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    await deploy('UnlimitedSupplyToken', {
        from: owner,
        args: ['THX Unlimited Supply Token', 'UNL-THX', owner],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    await deploy('NonFungibleToken', {
        from: owner,
        args: ['THX Non Fungible Token', 'NFT-THX', 'https://api.thx.network/v1/erc721/metadata/', owner],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    await deploy('THX_ERC1155', {
        from: owner,
        args: ['https://api.thx.network/v1/erc1155/metadata/', owner],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        waitConfirmations: network.live ? 3 : 0,
    });

    return network.live; // Makes sure we don't redeploy on live networks
};
export default func;
func.id = 'tokens';
func.tags = ['LimitedSupplyToken', 'UnlimitedSupplyToken', 'NonFungibleToken', 'THX_ERC1155'];
