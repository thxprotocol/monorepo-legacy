import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { ChainId } from '@thxnetwork/common/enums';
import type {
    TERC1155,
    IERC1155s,
    TERC1155Metadata,
    MetadataListProps,
    TMetadataResponse,
    IERC1155Metadatas,
} from '@thxnetwork/dashboard/types/erc1155';
import { track } from '@thxnetwork/common/mixpanel';

@Module({ namespaced: true })
class ERC1155Module extends VuexModule {
    _all: IERC1155s = {};
    _metadata: IERC1155Metadatas = {};
    _tokens: { [erc1155Id: string]: { [tokenId: string]: TERC1155Token } } = {};
    _totalsMetadata: { [erc1155Id: string]: number } = {};

    get tokens() {
        return this._tokens;
    }

    get all() {
        return this._all;
    }

    get metadata() {
        return this._metadata;
    }

    get totalsMetadata() {
        return this._totalsMetadata;
    }

    @Mutation
    set(erc1155: TERC1155) {
        Vue.set(this._all, erc1155._id, erc1155);
    }

    @Mutation
    unset(erc1155: TERC1155) {
        Vue.delete(this._all, erc1155._id);
    }

    @Mutation
    setERC1155Token(token: TERC1155Token) {
        if (!this._tokens[token.erc1155Id]) Vue.set(this._tokens, token.erc1155Id, {});
        Vue.set(this._tokens[token.erc1155Id], token._id, token);
    }

    @Mutation
    setMetadata({ erc1155, metadata }: { erc1155: TERC1155; metadata: TERC1155Metadata }) {
        if (!this._metadata[erc1155._id]) Vue.set(this._metadata, erc1155._id, {});
        Vue.set(this._metadata[erc1155._id], metadata._id, metadata);
    }

    @Mutation
    unsetMetadata({ erc1155, metadata }: { erc1155: TERC1155; metadata: TERC1155Metadata }) {
        Vue.delete(this._metadata[erc1155._id], metadata._id);
    }

    @Mutation
    setTotal({ erc1155, total }: { erc1155: TERC1155; total: number }) {
        Vue.set(this._totalsMetadata, erc1155._id, total);
    }

    @Action({ rawError: true })
    async list(params: { archived?: boolean } = { archived: false }) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc1155',
            params,
        });

        for (const _id of data) {
            this.context.commit('set', { _id, loading: true });
        }
    }

    @Action({ rawError: true })
    async update({ erc1155, data }: { erc1155: TERC1155; data: { archived: boolean } }) {
        await axios({
            method: 'PATCH',
            url: `/erc1155/${erc1155._id}`,
            data,
        });

        this.context.commit('set', { ...erc1155, ...data });

        if (data.archived) {
            this.context.commit('unset', erc1155);
        }
    }

    @Action({ rawError: true })
    async remove(erc1155: TERC1155) {
        await axios({
            method: 'DELETE',
            url: `/erc1155/${erc1155._id}`,
        });

        this.context.commit('unset', erc1155);
    }

    @Action({ rawError: true })
    async getBalance({ pool, token }: any) {
        if (!token) return;
        const { data } = await axios({
            method: 'GET',
            url: `/pools/${pool._id}/erc1155/balance`,
            params: {
                contractAddress: token.nft.address,
                tokenId: token.tokenId,
            },
        });
        return data.balance;
    }

    @Action({ rawError: true })
    async listMetadata({ page = 1, limit, erc1155 }: MetadataListProps) {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));

        const { data }: TMetadataResponse = await axios({
            method: 'GET',
            url: `/erc1155/${erc1155._id}/metadata`,
            params,
        });

        this.context.commit('setTotal', { erc1155, total: data.total });

        for (const metadata of data.results) {
            metadata.page = page;
            this.context.commit('setMetadata', { erc1155, metadata });
        }
    }

    @Action({ rawError: true })
    async searchMetadata({ page = 1, limit, erc1155, query }: MetadataListProps) {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        params.set('q', String(query));

        const { data }: TMetadataResponse = await axios({
            method: 'GET',
            url: `/erc1155/${erc1155._id}/metadata`,
            params,
        });

        this.context.commit('setTotal', { erc1155, total: data.total });

        for (const metadata of data.results) {
            metadata.page = page;
            this.context.commit('setMetadata', { erc1155, metadata });
        }
    }

    @Action({ rawError: true })
    async readMetadata({ erc1155, metadataId }: { erc1155: TERC1155; metadataId: string }) {
        const { data }: TMetadataResponse = await axios({
            method: 'GET',
            url: `/erc1155/${erc1155._id}/metadata/${metadataId}`,
        });
        const metadata = this._metadata[erc1155._id] ? { ...this._metadata[erc1155._id][metadataId], ...data } : data;
        this.context.commit('setMetadata', {
            erc1155,
            metadata,
        });
    }

    @Action({ rawError: true })
    async deleteMetadata({ erc1155, metadata }: { pool: TPool; erc1155: TERC1155; metadata: TERC1155Metadata }) {
        await axios({
            method: 'DELETE',
            url: `/erc1155/${erc1155._id}/metadata/${metadata._id}`,
        });
        this.context.commit('unsetMetadata', { erc1155, metadata });
    }

    @Action({ rawError: true })
    async read(id: string) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc1155/' + id,
        });

        this.context.commit('set', {
            ...data,
            metadata: {},
            loading: false,
            logoURI: data.logoImgUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.address}`,
        });
    }

    @Action({ rawError: true })
    async create(payload: { chainId: ChainId; name: string; description: string; file?: File }) {
        const formData = new FormData();
        formData.set('chainId', payload.chainId.toString());
        formData.set('name', payload.name);
        formData.set('description', payload.description);

        if (payload.file) {
            formData.append('file', payload.file);
        }

        const { data } = await axios({
            method: 'POST',
            url: '/erc1155',
            data: formData,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'erc1155']);

        this.context.commit('set', data);
    }

    @Action({ rawError: true })
    async createMetadata({ erc1155, metadata }: { erc1155: TERC1155; metadata: TERC1155Metadata }) {
        const { data } = await axios({
            method: 'POST',
            url: `/erc1155/${erc1155._id}/metadata`,
            data: metadata,
        });
        this.context.commit('setMetadata', {
            erc1155,
            metadata: { ...metadata, ...data },
        });
    }

    @Action({ rawError: true })
    async updateMetadata({ erc1155, metadata }: { erc1155: TERC1155; metadata: TERC1155Metadata }) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/erc1155/${erc1155._id}/metadata/${metadata._id}`,
            data: metadata,
        });

        this.context.commit('setMetadata', {
            erc1155,
            metadata: { ...metadata, ...data },
        });
    }

    @Action({ rawError: true })
    async preview(payload: { chainId: ChainId; address: string }) {
        const { data } = await axios({
            method: 'POST',
            url: '/erc1155/preview',
            data: payload,
        });

        return data;
    }

    @Action({ rawError: true })
    async import(payload: { contractAddress: string; pool: TPool; name?: string }) {
        const { data } = await axios({
            method: 'POST',
            url: `/erc1155/import`,
            headers: { 'X-PoolId': payload.pool._id },
            data: {
                contractAddress: payload.contractAddress,
                chainId: payload.pool.chainId,
            },
        });

        await this.context.dispatch('read', data.erc1155._id);
    }

    @Action({ rawError: true })
    async listTokens(wallet: TWallet) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc1155/token',
            params: { walletId: wallet._id },
        });

        data.forEach((token: TERC1155Token & { nft: TERC1155 }) => {
            this.context.commit('setERC1155Token', token);
        });
    }

    @Action({ rawError: true })
    async getToken(token: TERC1155Token) {
        const { data } = await axios({
            method: 'GET',
            url: `/erc1155/token/${token._id}`,
        });
        this.context.commit('setERC1155Token', data);
    }
}

export default ERC1155Module;
