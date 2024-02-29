import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { v4 } from 'uuid';
import { RewardCoin, RewardCoinDocument } from '@thxnetwork/api/models';
import { PoolDocument, RewardCoinPayment } from '@thxnetwork/api/models';
import { IRewardService } from './interfaces/IRewardService';

export default class RewardCoinService implements IRewardService {
    models = {
        reward: RewardCoin,
        payment: RewardCoinPayment,
    };

    async findPayments(reward: RewardCoinDocument) {
        return this.models.payment.find({ rewardId: reward._id });
    }

    async get(id: string): Promise<RewardCoinDocument> {
        return await RewardCoin.findById(id);
    }

    async findByPool(pool: PoolDocument, page: number, limit: number) {
        const result = await paginatedResults(RewardCoin, page, limit, {
            poolId: pool._id,
        });
        result.results = result.results.map((r) => r.toJSON());
        return result;
    }

    async removeAllForPool(pool: PoolDocument) {
        await RewardCoin.deleteMany({ poolId: pool._id });
    }

    async create(pool: PoolDocument, payload: TRewardCoin) {
        return await RewardCoin.create({
            poolId: String(pool._id),
            uuid: v4(),
            ...payload,
        });
    }

    async update(reward: RewardCoinDocument, payload: TRewardCoin) {
        return await RewardCoin.findByIdAndUpdate(reward._id, payload, { new: true });
    }

    async remove(reward: RewardCoinDocument) {
        return await RewardCoin.findOneAndDelete(reward._id);
    }
}
