<template>
    <div v-if="mdata">
        <b-tooltip :target="`tooltip-target-${metadataId}-${index}`" triggers="hover">
            <b-link :href="mdata.imageUrl" target="_blank" v-if="mdata.image">
                <img :src="mdata.imageUrl" class="mt-2 rounded" width="180" height="auto" />
            </b-link>
            <strong>{{ mdata.name }}</strong>
            {{ mdata.description }}
            <b-link :href="mdata.externalUrl" target="_blank">External URL</b-link>
        </b-tooltip>
        <div class="d-flex align-items-center">
            <div class="d-flex mr-2 rounded bg-gray text-white p-2" :id="`tooltip-target-${metadataId}-${index}`">
                <i class="fas fa-photo-video"></i>
            </div>
            <p style="line-height: 1" class="text-gray m-0">
                <strong>{{ mdata.name }}</strong>
                <b-link :href="mdata.externalUrl" target="_blank" class="ml-2 text-gray">
                    <i class="fas fa-external-link-alt" style="font-size: 0.8rem"></i>
                </b-link>
                <br />
                <span v-if="mdata.description">{{ mdata.description.substring(0, 25) }}... </span>
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { IERC721Metadatas, IERC721s, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        erc721s: 'erc721/all',
        metadata: 'erc721/metadata',
    }),
})
export default class BaseBadgeMetadataPreview extends Vue {
    erc721s!: IERC721s;
    metadata!: IERC721Metadatas;

    @Prop() index!: number;
    @Prop({ required: true }) erc721Id!: string;
    @Prop({ required: true }) metadataId!: string;

    get erc721() {
        return this.erc721s[this.erc721Id];
    }

    get mdata(): TERC721Metadata | null {
        if (!this.metadata[this.erc721Id] || !this.metadata[this.erc721Id][this.metadataId]) return null;
        return this.metadata[this.erc721Id][this.metadataId];
    }

    async mounted() {
        if (!this.erc721) {
            await this.$store.dispatch('erc721/read', this.erc721Id);
        }
        if (
            (this.erc721 && !this.metadata[this.erc721Id]) ||
            (this.erc721 && !this.metadata[this.erc721Id][this.metadataId])
        ) {
            await this.$store.dispatch('erc721/readMetadata', {
                erc721: this.erc721,
                metadataId: this.metadataId,
            });
        }
    }
}
</script>
