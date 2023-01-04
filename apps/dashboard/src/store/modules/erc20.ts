import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import type { IERC20s, TERC20 } from '@thxnetwork/dashboard/types/erc20';
import { ChainId } from '../enums/chainId';
import { prepareFormDataForUpload } from '@thxnetwork/dashboard/utils/uploadFile';

@Module({ namespaced: true })
class ERC20Module extends VuexModule {
    _all: IERC20s = {};

    get all() {
        return this._all;
    }

    @Mutation
    set(erc20: TERC20) {
        Vue.set(this._all, erc20._id, erc20);
    }

    @Mutation
    unset(erc20: TERC20) {
        Vue.delete(this._all, erc20._id);
    }

    @Mutation
    clear() {
        Vue.set(this, '_all', {});
    }

    @Action({ rawError: true })
    async list(params: { archived?: boolean } = { archived: false }) {
        this.context.commit('clear');

        const { data } = await axios({
            method: 'GET',
            url: '/erc20',
            params,
        });

        for (const _id of data) {
            this.context.commit('set', { _id, loading: true });
        }
    }

    @Action({ rawError: true })
    async read(id: string) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc20/' + id,
        });
        if (!data.logoImgUrl || data.logoImgUrl.length == 0) {
            data.logoImgUrl = `https://avatars.dicebear.com/api/identicon/${data.address}.svg`;
        }
        const erc20 = {
            ...data,
            loading: false,
            logoURI: data.logoImgUrl || `https://avatars.dicebear.com/api/identicon/${data.address}.svg`,
        };

        this.context.commit('set', erc20);

        return erc20;
    }

    @Action({ rawError: true })
    async create(payload: any) {
        const formData = prepareFormDataForUpload(payload);

        const { data } = await axios({
            method: 'POST',
            url: '/erc20/',
            data: formData,
        });

        this.context.commit('set', { _id: data._id, loading: true });
    }

    @Action({ rawError: true })
    async import(payload: any) {
        const { data } = await axios({
            method: 'POST',
            url: '/erc20/token',
            data: payload,
        });

        this.context.commit('set', { _id: data._id, loading: true });
    }

    @Action({ rawError: true })
    async remove(id: string) {
        await axios({
            method: 'DELETE',
            url: '/erc20/' + id,
        });

        this.context.commit('unset', id);
    }

    @Action({ rawError: true })
    async update({ erc20, data }: { erc20: TERC20; data: { archived: boolean } }) {
        await axios({
            method: 'PATCH',
            url: `/erc20/${erc20._id}`,
            data,
        });

        this.context.commit('set', { ...erc20, ...data });

        if (data.archived) {
            this.context.commit('unset', erc20);
        }
    }

    @Action({ rawError: true })
    async preview(payload: { chainId: ChainId; address: string }) {
        const { data } = await axios({
            method: 'POST',
            url: '/erc20/preview',
            data: payload,
        });

        return data;
    }
}

export default ERC20Module;
