<template>
    <div>
        <b-tooltip :target="`tooltip-target-${metadataId}-${index}`" triggers="hover">
            <b-link :href="attributes.image" target="_blank" v-if="attributes.image">
                <img :src="attributes.image" class="mt-2 rounded" width="180" height="auto" />
            </b-link>
            <strong>{{ attributes.name }}</strong>
            {{ attributes.description }}
            <b-link :href="attributes.external_url" target="_blank">External URL</b-link>
        </b-tooltip>
        <div class="d-flex align-items-center">
            <div class="d-flex mr-2 rounded bg-dark text-white p-2" :id="`tooltip-target-${metadataId}-${index}`">
                <i class="fas fa-photo-video"></i>
            </div>
            <p style="line-height: 1" class="text-muted m-0">
                <strong>{{ attributes.name }}</strong>
                <b-link
                    v-if="attributes.external_url"
                    :href="attributes.external_url"
                    target="_blank"
                    class="ml-2 text-muted"
                >
                    <i class="fas fa-external-link-alt" style="font-size: 0.8rem"></i>
                </b-link>
                <br />
                <span v-if="attributes.description">{{ attributes.description.substring(0, 25) }}... </span>
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { IERC721s } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        erc721s: 'erc721/all',
    }),
})
export default class BaseBadgeMetadataPreview extends Vue {
    erc721s!: IERC721s;

    @Prop() index!: number;
    @Prop({ required: true }) erc721Id!: string;
    @Prop({ required: true }) metadataId!: string;

    get erc721() {
        return this.erc721s[this.erc721Id];
    }

    get attributes() {
        if (!this.erc721 || !this.erc721.metadata[this.metadataId]) return {};

        const attributes: { [key: string]: string } = {};
        for (const attr of this.erc721.metadata[this.metadataId].attributes) {
            attributes[attr.key] = attr.value;
        }

        return attributes;
    }

    async mounted() {
        if (!this.erc721) {
            await this.$store.dispatch('erc721/read', this.erc721Id);
        }
        if (this.erc721 && !this.erc721s[this.erc721._id].metadata[this.metadataId]) {
            await this.$store.dispatch('erc721/readMetadata', {
                erc721: this.erc721,
                metadataId: this.metadataId,
            });
        }
    }
}
</script>
