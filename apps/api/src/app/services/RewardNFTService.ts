import {
    ERC1155,
    PoolDocument,
    RewardNFT,
    RewardNFTDocument,
    RewardNFTPayment,
    WalletDocument,
} from '@thxnetwork/api/models';
import { IRewardService } from './interfaces/IRewardService';
import ERC721Service from './ERC721Service';
import ERC1155Service from './ERC1155Service';
import ClaimService from './ClaimService';
import PoolService from './PoolService';
import SafeService from './SafeService';

export default class RewardNFTService implements IRewardService {
    models = {
        reward: RewardNFT,
        payment: RewardNFTPayment,
    };

    findById(id: string) {
        return this.models.reward.findById(id);
    }

    async create(data: Partial<TRewardNFT>) {
        // If erc721Id or erc1155Id, check if campaign safe is minter
        if (data.metadataId) {
            const pool = await PoolService.getById(data.poolId);
            const safe = await SafeService.findOneByPool(pool, pool.chainId);
            await this.addMinter(data, safe.address);
        }

        // If claimAmount is set, create QR Codes
        if (data.claimAmount) {
            await this.createQRCodes(data);
        }

        return this.models.reward.create(data);
    }

    private async createQRCodes(data: Partial<TRewardNFT>) {
        await ClaimService.create(
            {
                poolId: data.poolId,
                rewardUuid: data.uuid,
                erc721Id: data.erc721Id,
                erc1155Id: data.erc1155Id,
            },
            data.claimAmount,
        );
    }

    private async addMinter({ erc721Id, erc1155Id }: { erc721Id?: string; erc1155Id?: string }, address: string) {
        let service, nft;

        if (erc721Id) {
            service = await ERC721Service.findById(erc721Id);
            nft = await ERC721Service.findById(erc721Id);
        }

        if (erc1155Id) {
            service = ERC1155Service;
            nft = ERC1155Service.findById(erc1155Id);
        }

        const isMinter = await service.isMinter(nft, address);
        if (!isMinter) await service.addMinter(nft, address);
    }

    update(reward: TRewardNFT, updates: Partial<TRewardNFT>) {
        return this.models.reward.findByIdAndUpdate(reward._id, updates, { new: true });
    }

    remove(reward: RewardNFTDocument) {
        return this.models.reward.findOneAndDelete(reward._id);
    }

    findPayments(reward: RewardNFTDocument) {
        return this.models.payment.find({ rewardId: reward._id });
    }
}
