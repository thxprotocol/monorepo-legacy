<template>
    <div variant="light" class="d-flex align-items-center">
        <b-tooltip :target="`tooltip-target-${metadata._id}-${index}`" triggers="hover">
            <b-link :href="image" target="_blank">
                <img :src="image" class="mt-2 rounded" width="180" height="auto" />
            </b-link>
            <strong>{{ name }}</strong>
            {{ description }}
            <b-link :href="external_url" target="_blank">External URL</b-link>
        </b-tooltip>
        <img
            v-if="image"
            :id="`tooltip-target-${metadata._id}-${index}`"
            :src="image"
            class="mr-2 rounded"
            width="auto"
            height="30"
        />
        <p style="line-height: 1" class="text-muted m-0">
            <span>{{ name }}</span>
            <i v-if="external_url" class="fas fa-external-link-alt ml-1" style="font-size: 0.8rem"></i>
            <br />
            <span v-if="description">{{ description.substring(0, 25) }}... </span>
        </p>
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
