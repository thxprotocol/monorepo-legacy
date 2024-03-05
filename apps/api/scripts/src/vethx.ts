import { getProvider } from '@thxnetwork/api/util/network';
import { ChainId } from '@thxnetwork/common/enums';
import { contractArtifacts } from '@thxnetwork/contracts/exports';
import { ethers } from 'ethers';
import { toChecksumAddress } from 'web3-utils';

// TestCrow VE Deployment
// LensReward: 0x6f908EFc188DB4D9d1b5635E1B8F6C594B7df069
// RewardDistributor: 0x417e1bCF39742534ae65988E4Eb3eAC1A243cBC0 // Deployed Distributor
// User: 0xD8F8D283092094B9C88E566DB1A8B72513C7809b // TestCrow User
// Token: 0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3 // BAL Token

// Get current reward amount for user address
export default async function main() {
    const { signer } = getProvider(ChainId.Polygon);
    const { abi } = contractArtifacts['LensReward'];
    // const lens = await new ethers.ContractFactory(abi, bytecode, signer).deploy();
    const lens = new ethers.Contract('0x6f908EFc188DB4D9d1b5635E1B8F6C594B7df069', abi, signer);
    const { claimableAmount } = await lens.callStatic.getUserClaimableReward(
        toChecksumAddress('0x417e1bCF39742534ae65988E4Eb3eAC1A243cBC0'),
        toChecksumAddress('0xD8F8D283092094B9C88E566DB1A8B72513C7809b'),
        toChecksumAddress('0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3'),
    );
    console.log(claimableAmount);
}
