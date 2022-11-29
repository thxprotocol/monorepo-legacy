<template>
    <div>
        <b-tooltip :target="`tooltip-target-${metadata._id}-${index}`" triggers="hover">
            <b-link :href="image" target="_blank" v-if="image">
                <img :src="image" class="mt-2 rounded" width="180" height="auto" />
            </b-link>
            <strong>{{ name }}</strong>
            {{ description }}
            <b-link :href="external_url" target="_blank">External URL</b-link>
        </b-tooltip>
        <div class="d-flex align-items-center">
            <div class="d-flex mr-2 rounded bg-dark text-white p-2" :id="`tooltip-target-${metadata._id}-${index}`">
                <i class="fas fa-photo-video"></i>
            </div>
            <p style="line-height: 1" class="text-muted m-0">
                <strong>{{ name }}</strong>
                <b-link v-if="external_url" :href="external_url" target="_blank" class="ml-1">
                    <i class="fas fa-external-link-alt" style="font-size: 0.8rem"></i>
                </b-link>
                <br />
                <span v-if="description">{{ description.substring(0, 25) }}... </span>
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { type TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseBadgeMetadataPreview extends Vue {
    image = '';
    name = '';
    description = '';
    external_url = '';

    @Prop() index!: number;
    @Prop() metadata!: TERC721Metadata;

    mounted() {
        if (this.metadata) {
            this.metadata.attributes.forEach((attr) => {
                (this as any)[attr.key] = attr.value;
            });
        }
    }
}
</script>
