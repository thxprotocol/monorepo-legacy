import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';

export type TQRCodeEntryURLData = TQRCodeEntry & {
    chainId: ChainId;
    poolAddress: string;
    tokenSymbol: string;
    withdrawAmount: number;
    clientId: string;
};

export interface TQRCodeEntryState {
    [rewardId: string]: TPaginationResult & { results: TQRCodeEntry[] };
}

@Module({ namespaced: true })
class QRCodeModule extends VuexModule {
    _all: TQRCodeEntryState = {};

    get all() {
        return this._all;
    }

    @Mutation
    setQRCodes({ rewardId, result }: { rewardId: string; result: TPaginationResult & { results: TQRCodeEntry[] } }) {
        Vue.set(this._all, rewardId, result);
    }

    @Action({ rawError: true })
    async create(data: Partial<TQRCodeEntry>) {
        await axios({
            method: 'POST',
            url: `/qr-codes`,
            data,
        });
    }

    @Action({ rawError: true })
    async list({ reward, limit, page }: { reward: TRewardNFT; limit: number; page: number }) {
        const { data } = await axios({
            method: 'GET',
            url: `/qr-codes`,
            params: {
                rewardId: reward._id,
                limit,
                page,
            },
        });

        this.context.commit('setQRCodes', { rewardId: reward._id, result: data });
    }
}

export default QRCodeModule;
