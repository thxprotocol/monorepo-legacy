<template>
    <b-card class="mb-3" :img-src="imgUrl" img-alt="Image" img-top>
        <div class="d-flex align-items-center justify-content-between">
            <strong class="mr-2">{{ token.erc721.name }} </strong>
            <div>
                <b-spinner v-if="!token.tokenId" small variant="gray" v-b-tooltip title="NFT minting in progress..." />
                <b-badge variant="light" class="p-2" v-else>#{{ token.tokenId }}</b-badge>
            </div>
        </div>
        <hr />
        <div v-if="mdata">
            <b-form-group label="Attributes" label-class="text-muted">
                <b-badge
                    variant="darker"
                    v-b-tooltip
                    :title="attr.value"
                    class="p-2 mr-1 mb-1 rounded-pill"
                    :key="key"
                    v-for="(attr, key) in mdata.attributes"
                >
                    {{ attr.key }}
                </b-badge>
            </b-form-group>
            <hr />
        </div>
        <b-button
            block
            class="rounded-pill"
            variant="primary"
            :disabled="!token.tokenId"
            :href="token.erc721.blockExplorerUrl + `?a=${token.tokenId}#inventory`"
            target="_blank"
        >
            Visit Block Explorer
            <i class="fas fa-external-link-alt ml-2"></i>
        </b-button>
        <b-button
            :disabled="!token.tokenUri"
            block
            class="rounded-pill"
            variant="link"
            :href="token.tokenUri"
            target="_blank"
        >
            View metadata
            <i class="fas fa-photo-video ml-2"></i>
        </b-button>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import type { TERC721Metadata, TERC721Token } from '@thxnetwork/wallet/store/modules/erc721';
import BaseModalTransferTokens from '@thxnetwork/wallet/components/modals/ModalTransferTokens.vue';
import BaseCardErc721Token from '@thxnetwork/wallet/components/cards/BaseCardERC721Token.vue';
import BaseIdenticon from '@thxnetwork/wallet/components/BaseIdenticon.vue';
import { mapState } from 'vuex';
import poll from 'promise-poller';

@Component({
    components: {
        BaseCardErc721Token,
        BaseModalTransferTokens,
        BaseIdenticon,
    },
    computed: {
        ...mapState('erc721', ['metadata']),
    },
})
export default class BaseCardNFT extends Vue {
    metadata!: { [_tokenId: string]: TERC721Metadata };

    get mdata() {
        if (!this.token) return null;
        return this.metadata[this.token._id];
    }

    @Prop() token!: TERC721Token;

    async mounted() {
        await this.$store.dispatch('erc721/getMetadata', this.token);
        this.waitForMinted();
    }

    get imgUrl() {
        let url = '';
        this.token.erc721.properties.forEach((p) => {
            if (!this.metadata[this.token._id]) return;
            if (p.propType === 'image') {
                const attrs = this.metadata[this.token._id].attributes;
                const attr: any = Object.values(attrs).find((a: any) => a.key === p.name);
                if (attr) {
                    url = attr.value;
                }
            }
        });
        return url;
    }

    async waitForMinted() {
        const taskFn = async () => {
            await this.$store.dispatch('erc721/getToken', this.token._id);
            if (this.token.tokenId) {
                return Promise.resolve();
            } else {
                return Promise.reject('Could not find tokenID');
            }
        };

        return poll({ taskFn, interval: 3000, retries: 10 });
    }
}
</script>
