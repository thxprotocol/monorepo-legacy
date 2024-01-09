import { GateVariant } from '@thxnetwork/common/lib/types/enums';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { Gate, GateDocument } from '@thxnetwork/api/models/Gate';
import { getContractFromName } from '@thxnetwork/api/config/contracts';
import { fromWei } from 'web3-utils';
import GitcoinService from '@thxnetwork/api/services/GitcoinService';

async function verify({ variant, contractAddress, amount }: GateDocument, wallet: WalletDocument): Promise<boolean> {
    switch (variant) {
        case GateVariant.ERC20: {
            const contract = getContractFromName(wallet.chainId, 'LimitedSupplyToken', contractAddress);
            const balance = Number(fromWei(await contract.methods.balanceOf(wallet.address).call(), 'ether'));

            return balance >= amount;
        }
        case GateVariant.ERC721: {
            const contract = getContractFromName(wallet.chainId, 'NonFungibleToken', contractAddress);
            const balance = Number(await contract.methods.balanceOf(wallet.address).call());

            return !!balance;
        }
        case GateVariant.ERC1155: {
            const contract = getContractFromName(wallet.chainId, 'THX_ERC1155', contractAddress);
            const balance = Number(await contract.methods.balanceOf(wallet.address).call());
            return !!balance;
        }
        case GateVariant.UniqueHumanity: {
            const score = await GitcoinService.getScoreUniqueHumanity(wallet.address);

            return score >= amount;
        }
    }
}

async function getIsLocked(gateIds: string[], wallet: WalletDocument) {
    const getGateVerificationResult = async (gateId: string) => {
        const gate = await Gate.findById(gateId);
        return await verify(gate, wallet);
    };
    const promises = gateIds.map(getGateVerificationResult);
    const results = await Promise.allSettled(promises);
    const anyRejected = results.some((result) => result.status === 'rejected');
    if (anyRejected) return true;

    return results
        .filter((result) => result.status === 'fulfilled')
        .map((result: any & { value: boolean }) => result.value)
        .includes(false);
}

export default { getIsLocked };
