import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import type {
    TERC721,
    IERC721s,
    TERC721Metadata,
    MetadataListProps,
    TMetadataResponse,
    IERC721Metadatas,
    IERC721Tokens,
    TERC721Token,
} from '@thxnetwork/dashboard/types/erc721';
import JSZip from 'jszip';
import { track } from '@thxnetwork/common/mixpanel';

@Module({ namespaced: true })
class ERC721Module extends VuexModule {
    _all: IERC721s = {};
    _metadata: IERC721Metadatas = {};
    _tokens: IERC721Tokens = {};
    _totalsMetadata: { [erc721Id: string]: number } = {};

    get all() {
        return this._all;
    }

    get metadata() {
        return this._metadata;
    }

    get totalsMetadata() {
        return this._totalsMetadata;
    }

    get tokens() {
        return this._tokens;
    }

    @Mutation
    set(erc721: TERC721) {
        Vue.set(this._all, erc721._id, erc721);
    }

    @Mutation
    unset(erc721: TERC721) {
        Vue.delete(this._all, erc721._id);
    }

    @Mutation
    setMetadata({ erc721, metadata }: { erc721: TERC721; metadata: TERC721Metadata }) {
        if (!this._metadata[erc721._id]) Vue.set(this._metadata, erc721._id, {});
        Vue.set(this._metadata[erc721._id], metadata._id, metadata);
    }

    @Mutation
    setERC721Token(token: TERC721Token) {
        if (!this._tokens[token.erc721Id]) Vue.set(this._tokens, token.erc721Id, {});
        Vue.set(this._tokens[token.erc721Id], token._id, token);
    }

    @Mutation
    unsetMetadata({ erc721, metadata }: { erc721: TERC721; metadata: TERC721Metadata }) {
        Vue.delete(this._metadata[erc721._id], metadata._id);
    }

    @Mutation
    setTotal({ erc721, total }: { erc721: TERC721; total: number }) {
        Vue.set(this._totalsMetadata, erc721._id, total);
    }

    @Action({ rawError: true })
    async list(params: { archived?: boolean } = { archived: false }) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc721',
            params,
        });

        for (const _id of data) {
            this.context.commit('set', { _id, loading: true });
        }
    }

    @Action({ rawError: true })
    async update({ erc721, data }: { erc721: TERC721; data: { archived: boolean } }) {
        await axios({
            method: 'PATCH',
            url: `/erc721/${erc721._id}`,
            data,
        });

        this.context.commit('set', { ...erc721, ...data });

        if (data.archived) {
            this.context.commit('unset', erc721);
        }
    }

    @Action({ rawError: true })
    async remove(erc721: TERC721) {
        await axios({
            method: 'DELETE',
            url: `/erc721/${erc721._id}`,
        });

        this.context.commit('unset', erc721);
    }

    @Action({ rawError: true })
    async listMetadata({ page = 1, limit, erc721 }: MetadataListProps) {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));

        const { data }: TMetadataResponse = await axios({
            method: 'GET',
            url: `/erc721/${erc721._id}/metadata`,
            params,
        });

        this.context.commit('setTotal', { erc721, total: data.total });

        for (const metadata of data.results) {
            metadata.page = page;
            this.context.commit('setMetadata', { erc721, metadata });
        }
    }

    @Action({ rawError: true })
    async searchMetadata({ page = 1, limit, erc721, query }: MetadataListProps) {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        params.set('q', String(query));

        const { data }: TMetadataResponse = await axios({
            method: 'GET',
            url: `/erc721/${erc721._id}/metadata`,
            params,
        });

        this.context.commit('setTotal', { erc721, total: data.total });

        for (const metadata of data.results) {
            metadata.page = page;
            this.context.commit('setMetadata', { erc721, metadata });
        }
    }

    @Action({ rawError: true })
    async readMetadata({ erc721, metadataId }: { erc721: TERC721; metadataId: string }) {
        const { data }: TMetadataResponse = await axios({
            method: 'GET',
            url: `/erc721/${erc721._id}/metadata/${metadataId}`,
        });
        const metadata = this._metadata[erc721._id] ? { ...this._metadata[erc721._id][metadataId], ...data } : data;
        this.context.commit('setMetadata', {
            erc721,
            metadata,
        });
    }

    @Action({ rawError: true })
    async deleteMetadata({ erc721, metadata }: { pool: TPool; erc721: TERC721; metadata: TERC721Metadata }) {
        await axios({
            method: 'DELETE',
            url: `/erc721/${erc721._id}/metadata/${metadata._id}`,
        });
        this.context.commit('unsetMetadata', { erc721, metadata });
    }

    @Action({ rawError: true })
    async read(id: string) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc721/' + id,
        });

        this.context.commit('set', {
            ...data,
            metadata: {},
            loading: false,
            logoURI: data.logoImgUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.address}`,
        });
    }

    @Action({ rawError: true })
    async create(payload: { chainId: ChainId; name: string; symbol: string; description: string; file?: File }) {
        const formData = new FormData();
        formData.set('chainId', payload.chainId.toString());
        formData.set('name', payload.name);
        formData.set('symbol', payload.symbol);
        formData.set('description', payload.description);

        if (payload.file) {
            formData.append('file', payload.file);
        }

        const { data } = await axios({
            method: 'POST',
            url: '/erc721',
            data: formData,
        });

        const profile = this.context.rootGetters['account/profile'];
        track('UserCreates', [profile.sub, 'nft']);

        this.context.commit('set', data);
    }

    @Action({ rawError: true })
    async createMetadata({ erc721, metadata }: { erc721: TERC721; metadata: TERC721Metadata }) {
        const { data } = await axios({
            method: 'POST',
            url: `/erc721/${erc721._id}/metadata`,
            data: metadata,
        });
        this.context.commit('setMetadata', {
            erc721,
            metadata: { ...metadata, ...data },
        });
    }

    @Action({ rawError: true })
    async updateMetadata({ erc721, metadata }: { erc721: TERC721; metadata: TERC721Metadata }) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/erc721/${erc721._id}/metadata/${metadata._id}`,
            data: metadata,
        });

        this.context.commit('setMetadata', {
            erc721,
            metadata: { ...metadata, ...data },
        });
    }

    @Action({ rawError: true })
    async uploadMultipleMetadataImages(payload: {
        pool: TPool;
        erc721: TERC721;
        file: File;
        propName: string;
        name: string;
        description: string;
        externalUrl: string;
    }) {
        const now = Date.now();
        const zip = new JSZip();
        const zipFolder = zip.folder(`nft-images_${now}`);

        zipFolder?.file(payload.file.name, payload.file);

        const zipFile = await zip.generateAsync({ type: 'blob' });
        const files = new File([zipFile], `images_${now}.zip`);
        const formData = new FormData();

        formData.set('name', payload.name);
        formData.set('description', payload.description);
        formData.set('externalUrl', payload.externalUrl);
        formData.set('propName', payload.propName);
        formData.append('file', files);

        const { data } = await axios({
            method: 'POST',
            url: `/erc721/${payload.erc721._id}/metadata/zip`,
            headers: {
                'Content-Type': 'application/zip',
            },
            data: formData,
        });
        this.context.commit('setMetadata', {
            erc721: payload.erc721,
            metadata: data,
        });
    }

    @Action({ rawError: true })
    async createMetadataCSV(payload: { pool: TPool; erc721: TERC721 }) {
        const { status, data } = await axios({
            method: 'GET',
            url: `/erc721/${payload.erc721._id}/metadata/csv`,
            headers: {
                'Content-Type': 'text/csv',
            },
            responseType: 'blob',
        });

        if (status === 200) {
            // Fake an anchor click to trigger a download in the browser
            const anchor = document.createElement('a');
            anchor.href = window.URL.createObjectURL(new Blob([data]));
            anchor.setAttribute('download', `metadata_${payload.erc721._id}.csv`);
            document.body.appendChild(anchor);
            anchor.click();
        }
    }

    @Action({ rawError: true })
    async uploadMetadataCSV(payload: { pool: TPool; erc721: TERC721; file: File }) {
        const formData = new FormData();
        formData.append('file', payload.file);

        await axios({
            method: 'POST',
            url: `/erc721/${payload.erc721._id}/metadata/csv`,
            headers: {
                'Content-Type': 'application/zip',
            },
            data: formData,
        });
    }

    @Action({ rawError: true })
    async preview(payload: { chainId: ChainId; contractAddress: string; address: string }) {
        const { data } = await axios({
            method: 'POST',
            url: '/erc721/preview',
            data: payload,
        });

        return data;
    }

    @Action({ rawError: true })
    async import(payload: { address: string; pool: TPool }) {
        const { data } = await axios({
            method: 'POST',
            url: `/erc721/import`,
            headers: { 'X-PoolId': payload.pool._id },
            data: {
                contractAddress: payload.address,
                chainId: payload.pool.chainId,
            },
        });

        this.context.commit('set', data.erc721);
    }

    @Action({ rawError: true })
    async listTokens(pool: TPool) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc721/token',
            params: { walletId: pool.safe._id },
        });

        data.forEach((token: TERC721Token & { nft: TERC721 }) => {
            this.context.commit('setERC721Token', token);
        });
    }
}

export default ERC721Module;
