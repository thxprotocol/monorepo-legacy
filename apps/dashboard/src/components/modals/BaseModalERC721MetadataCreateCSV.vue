<template>
    <base-modal title="Download the precompiled CSV schema" id="modalNFTCreateMetadataCsv">
        <template #btn-primary>
            <b-button class="rounded-pill" @click="downloadCsv()" variant="primary" block> Download CSV </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import type { TPool } from '@thxnetwork/types/interfaces';
import type { TERC721 } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';

@Component({
    components: {
        BaseModal,
    },
    computed: mapGetters({}),
})
export default class ModalERC721MetadataCreateCSV extends Vue {
    @Prop() pool!: TPool;
    @Prop() erc721!: TERC721;

    async downloadCsv() {
        await this.$store.dispatch('erc721/createMetadataCSV', {
            pool: this.pool,
            erc721: this.erc721,
        });
        this.$bvModal.hide('modalNFTCreateMetadataCsv');
    }
}
</script>
