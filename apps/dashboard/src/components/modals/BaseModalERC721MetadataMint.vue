<template>
    <base-modal :error="error" title="Mint NFT" :id="`modalNFTMint${erc721Metadata._id}`">
        <template #modal-body>
            <label>Recipient</label>
            <b-form-group>
                <b-form-input v-model="recipient" placeholder="Recipient of the NFT" />
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button :disabled="loading" class="rounded-pill" @click="submit()" variant="primary" block>
                Mint NFT
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import type { TPool } from '@thxnetwork/dashboard/store/modules/pools';
import type { TERC721, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';

@Component({
    components: {
        BaseModal,
    },
    computed: mapGetters({}),
})
export default class ModalRewardCreate extends Vue {
    docsUrl = process.env.VUE_APP_DOCS_URL;
    loading = false;
    error = '';
    recipient = '';

    @Prop() pool!: TPool;
    @Prop() erc721!: TERC721;
    @Prop() erc721Metadata!: TERC721Metadata;

    get isSubmitDisabled() {
        return this.loading;
    }

    submit() {
        this.$store.dispatch('erc721/mint', {
            pool: this.pool,
            erc721: this.erc721,
            erc721Metadata: this.erc721Metadata,
            recipient: this.recipient,
        });

        this.$bvModal.hide(`modalNFTMint${this.erc721Metadata._id}`);
    }
}
</script>
