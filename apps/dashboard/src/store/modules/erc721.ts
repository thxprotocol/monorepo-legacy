import { Vue } from 'vue-property-decorator';
import axios from 'axios';
import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import { IPool } from './pools';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import type {
    TERC721,
    IERC721s,
    TERC721Metadata,
    TERC721DefaultProp,
    MetadataListProps,
    TMetadataResponse,
} from '@thxnetwork/dashboard/types/erc721';
import JSZip from 'jszip';

@Module({ namespaced: true })
class ERC721Module extends VuexModule {
    _all: IERC721s = {};
    _totalsMetadata: { [erc721Id: string]: number } = {};

    get all() {
        return this._all;
    }

    get totalsMetadata() {
        return this._totalsMetadata;
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
    clear() {
        Vue.set(this, '_all', {});
    }

    @Mutation
    setMetadata(payload: { erc721: TERC721; metadata: TERC721Metadata }) {
        if (!this._all[payload.erc721._id].metadata) {
            return Vue.set(this._all[payload.erc721._id], 'metadata', [payload.metadata]);
        }
        const index = payload.erc721.metadata
            ? payload.erc721.metadata.findIndex((m: TERC721Metadata) => m._id === payload.metadata._id) || 0
            : 0;

        Vue.set(
            this._all[payload.erc721._id]['metadata'],
            index > -1 ? index : payload.erc721.metadata.length++,
            payload.metadata,
        );
    }

    @Mutation
    setTotal({ erc721, total }: { erc721: TERC721; total: number }) {
        Vue.set(this._totalsMetadata, erc721._id, total);
    }

    @Action({ rawError: true })
    async list(params: { archived?: boolean } = { archived: false }) {
        this.context.commit('clear');

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
    async listMetadata({ page = 1, limit, erc721, q }: MetadataListProps) {
        if (!erc721) return;

        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        params.set('q', String(q));

        const { data }: TMetadataResponse = await axios({
            method: 'GET',
            url: `/erc721/${erc721._id}/metadata?${String(params)}`,
        });

        this.context.commit('setTotal', { erc721, total: data.total });

        for (const metadata of data.results) {
            metadata.page = page;
            this.context.commit('setMetadata', { erc721, metadata });
        }

        return data;
    }

    @Action({ rawError: true })
    async readMetadata({ erc721, metadataId }: { erc721: TERC721; metadataId: string }) {
        const { data }: TMetadataResponse = await axios({
            method: 'GET',
            url: `/erc721/${erc721._id}/metadata/${metadataId}`,
        });
        const metadata = this._all[erc721._id].metadata.find((m) => m._id === metadataId);
        this.context.commit('setMetadata', {
            erc721,
            metadata: { ...metadata, ...data },
        });
    }

    @Action({ rawError: true })
    async read(id: string) {
        const { data } = await axios({
            method: 'GET',
            url: '/erc721/' + id,
        });

        data.properties.map((prop: TERC721DefaultProp) => {
            prop.value = '';
            return prop;
        });

        const erc721 = {
            ...data,
            loading: false,
            logoURI: data.logoImgUrl || `https://avatars.dicebear.com/api/identicon/${data.address}.svg`,
        };

        this.context.commit('set', erc721);

        return erc721;
    }

    @Action({ rawError: true })
    async create(payload: {
        chainId: ChainId;
        name: string;
        symbol: string;
        schema: string[];
        description: string;
        file?: File;
    }) {
        const formData = new FormData();
        formData.set('chainId', payload.chainId.toString());
        formData.set('name', payload.name);
        formData.set('symbol', payload.symbol);
        formData.set('description', payload.description);
        formData.set('schema', JSON.stringify(payload.schema));

        if (payload.file) {
            formData.append('file', payload.file);
        }

        const { data } = await axios({
            method: 'POST',
            url: '/erc721',
            data: formData,
        });

        this.context.commit('set', data);
    }

    @Action({ rawError: true })
    async createMetadata(payload: {
        pool: IPool;
        erc721: TERC721;
        title?: string;
        description?: string;
        attributes: any;
        recipient?: string;
    }) {
        const { data } = await axios({
            method: 'POST',
            url: `/erc721/${payload.erc721._id}/metadata`,
            headers: { 'X-PoolId': payload.pool._id },
            data: {
                title: payload.title,
                description: payload.description,
                attributes: payload.attributes,
                recipient: payload.recipient,
            },
        });
        this.context.commit('setMetadata', {
            erc721: payload.erc721,
            metadata: data,
        });
    }

    @Action({ rawError: true })
    async updateMetadata(payload: {
        pool: IPool;
        erc721: TERC721;
        title?: string;
        description?: string;
        attributes: any;
        recipient?: string;
        id?: string;
    }) {
        const { data } = await axios({
            method: 'PATCH',
            url: `/erc721/${payload.erc721._id}/metadata/${payload.id}`,
            headers: { 'X-PoolId': payload.pool._id },
            data: {
                title: payload.title,
                description: payload.description,
                attributes: payload.attributes,
                recipient: payload.recipient,
            },
        });
        this.context.commit('setMetadata', {
            erc721: payload.erc721,
            metadata: data,
        });
    }

    @Action({ rawError: true })
    async mint({
        pool,
        erc721,
        erc721Metadata,
        recipient,
    }: {
        pool: IPool;
        erc721: TERC721;
        erc721Metadata: TERC721Metadata;
        recipient?: string;
    }) {
        const { data } = await axios({
            method: 'POST',
            url: `/erc721/${erc721._id}/metadata/${erc721Metadata._id}/mint`,
            headers: { 'X-PoolId': pool._id },
            data: {
                recipient,
            },
        });
        this.context.commit('setMetadata', { erc721, metadata: data });
    }

    @Action({ rawError: true })
    async uploadMultipleMetadataImages(payload: { pool: IPool; erc721: TERC721; file: File; propName: string }) {
        const now = Date.now();
        const zip = new JSZip();
        const zipFolder = zip.folder(`nft-images_${now}`);

        // await Promise.all(
        //     [...(payload.files as any)].map((x: File) => {
        //         return zipFolder?.file(x.name, x);
        //     }),
        // );
        zipFolder?.file(payload.file.name, payload.file);
        const zipFile = await zip.generateAsync({ type: 'blob' });

        const files = new File([zipFile], `images_${now}.zip`);

        const formData = new FormData();
        formData.set('propName', payload.propName);
        formData.append('file', files);

        const { data } = await axios({
            method: 'POST',
            url: `/erc721/${payload.erc721._id}/metadata/zip`,
            headers: {
                'Content-Type': 'application/zip',
                'X-PoolId': payload.pool._id,
            },
            data: formData,
        });
        this.context.commit('setMetadata', {
            erc721: payload.erc721,
            metadata: data,
        });
    }

    @Action({ rawError: true })
    async createMetadataCSV(payload: { pool: IPool; erc721: TERC721 }) {
        const { status, data } = await axios({
            method: 'GET',
            url: `/erc721/${payload.erc721._id}/metadata/csv`,
            headers: {
                'Content-Type': 'text/csv',
                'X-PoolId': payload.pool._id,
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
    async uploadMetadataCSV(payload: { pool: IPool; erc721: TERC721; file: File }) {
        const formData = new FormData();
        formData.append('file', payload.file);

        await axios({
            method: 'POST',
            url: `/erc721/${payload.erc721._id}/metadata/csv`,
            headers: {
                'Content-Type': 'application/zip',
                'X-PoolId': payload.pool._id,
            },
            data: formData,
        });
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
    async getMetadataQRCodes({ pool, erc721 }: { pool: IPool; erc721: TERC721 }) {
        const { status, data } = await axios({
            method: 'GET',
            url: `/erc721/${erc721._id}/metadata/zip`,
            headers: { 'X-PoolId': pool._id },
            responseType: 'blob',
        });
        // Check if job has been queued, meaning file is not available yet
        if (status === 201) return true;
        // Check if response is zip file, meaning job has completed
        if (status === 200 && data.type == 'application/zip') {
            // Fake an anchor click to trigger a download in the browser
            const anchor = document.createElement('a');
            anchor.href = window.URL.createObjectURL(new Blob([data]));
            anchor.setAttribute('download', `${pool._id}_metadata_qrcodes.zip`);
            document.body.appendChild(anchor);
            anchor.click();
        }
    }
}

export default ERC721Module;
