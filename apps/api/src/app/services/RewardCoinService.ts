import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { v4 } from 'uuid';
import { RewardCoin, RewardCoinDocument } from '@thxnetwork/api/models';
import { PoolDocument, RewardCoinPayment } from '@thxnetwork/api/models';
// import { IRewardService } from './interfaces/IRewardService';

// export default class RewardCoinService implements IRewardService {
export default class RewardCoinService {
    models = {
        reward: RewardCoin,
        payment: RewardCoinPayment,
    };

    static async findPayments(reward: RewardCoinDocument) {
        return RewardCoinPayment.find({ rewardId: reward._id });
    }

    static async get(id: string): Promise<RewardCoinDocument> {
        return await RewardCoin.findById(id);
    }

    static async findByPool(pool: PoolDocument, page: number, limit: number) {
        const result = await paginatedResults(RewardCoin, page, limit, {
            poolId: pool._id,
        });
        result.results = result.results.map((r) => r.toJSON());
        return result;
    }

    static async removeAllForPool(pool: PoolDocument) {
        await RewardCoin.deleteMany({ poolId: pool._id });
    }

    static async create(pool: PoolDocument, payload: TRewardCoin) {
        return await RewardCoin.create({
            poolId: String(pool._id),
            uuid: v4(),
            ...payload,
        });
    }

    static async update(reward: RewardCoinDocument, payload: TRewardCoin) {
        return await RewardCoin.findByIdAndUpdate(reward._id, payload, { new: true });
    }

    static async remove(reward: RewardCoinDocument) {
        return await RewardCoin.findOneAndDelete(reward._id);
    }
}
