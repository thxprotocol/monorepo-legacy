<template>
    <b-card :img-src="url" img-top bg-variant="light" class="small mb-2">
        <b-row>
            <b-col md="12">
                <strong>
                    <b-button
                        class="d-block mb-3 float-md-right rounded-pill"
                        size="sm"
                        variant="primary"
                        :href="erc721.baseURL + token.metadataId"
                    >
                        Metadata
                        <i class="fas fa-external-link-alt ml-1"></i>
                    </b-button>
                    <b-badge variant="dark">#{{ token.tokenId }}</b-badge>
                    {{ token.metadata.title }}
                </strong>
                <p class="small">{{ token.metadata.description }}</p>
            </b-col>
            <b-col md="4" :key="metadata._id" v-for="metadata of token.metadata.attributes">
                <b-form-group :label="metadata.key" label-class="text-muted pb-0" class="mb-md-0">
                    <b-img-lazy height="50" v-if="getPropType(metadata.key) == 'image'" :src="metadata.value" />
                    <template v-else>
                        <b-link
                            v-if="getPropType(metadata.key) == 'link'"
                            :href="metadata.value"
                            target=""
                            _blank
                            v-b-tooltip
                            :title="metadata.value"
                        >
                            Visit link
                        </b-link>
                        <template v-else>
                            {{ metadata.value }}
                        </template>
                    </template>
                </b-form-group>
            </b-col>
        </b-row>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ERC721 } from '@thxnetwork/wallet/store/modules/erc721';

@Component({})
export default class BaseListGroupItemNFT extends Vue {
    url = '';
    type = '';

    @Prop() erc721!: ERC721;
    @Prop() token!: any;

    mounted() {
        this.url = this.firstImageURL(this.token.metadata);
    }

    firstImageURL(metadata: any) {
        let url = '';
        this.erc721.properties.forEach(p => {
            if (p.propType === 'image') {
                url = metadata.attributes.find((a: { value: string; key: string }) => a.key === p.name).value;
            }
        });
        return url;
    }

    getPropType(key: string) {
        return this.erc721.properties.find(p => p.name === key)?.propType;
    }
}
</script>
