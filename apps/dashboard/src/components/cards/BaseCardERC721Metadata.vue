<template>
    <base-card>
        <template #card-body>
            <b-row class="d-none d-md-flex mb-3">
                <b-col md="2"><strong>Created</strong></b-col>
                <b-col md="5"><strong>Attributes</strong></b-col>
                <b-col><strong>Tokens</strong></b-col>
                <b-col> </b-col>
            </b-row>
            <b-row :key="key" v-for="(item, key) in metadata" class="mb-3 py-3 bg-light">
                <b-col cols="12" md="2" class="pb-3 pb-md-0">
                    <label class="d-md-none">Created: </label>
                    <small class="text-muted font-weight-bold">
                        {{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}
                    </small>
                </b-col>
                <b-col cols="12" md="5" class="pb-3 pb-md-0">
                    <label class="d-md-none">Attributes: </label>
                    <div>
                        <b-badge
                            :key="key"
                            v-for="(value, key) in item.attributes"
                            variant="dark"
                            v-b-tooltip
                            :title="value.value"
                            class="mr-2"
                        >
                            {{ value.key }}
                        </b-badge>
                    </div>
                </b-col>
                <b-col cols="12" md="3">
                    <label class="d-md-none">Tokens: </label>
                    <b-badge
                        class="mr-2"
                        variant="dark"
                        :key="token.tokenId"
                        v-for="token of item.tokens"
                        v-b-tooltip
                        :title="`Minted at: ${format(new Date(token.createdAt), 'dd-MM-yyyy HH:mm')}`"
                    >
                        #{{ token.tokenId }}
                    </b-badge>
                </b-col>
                <b-col cols="12" md="2" class="text-right">
                    <b-dropdown size="sm" class="float-right" variant="light">
                        <b-dropdown-item :disabled="!!item.tokens.length" @click="onEdit(item)">Edit</b-dropdown-item>
                        <b-dropdown-item target="_blank" :href="`${apiUrl}/v1/metadata/${item._id}`"
                            >View</b-dropdown-item
                        >
                        <b-dropdown-item v-b-modal="`modalNFTMint${item._id}`">Mint</b-dropdown-item>
                        <b-dropdown-item :disabled="!!item.tokens.length" @click="onDelete(item)"
                            >Delete</b-dropdown-item
                        >
                    </b-dropdown>

                    <base-modal-erc721-metadata-mint :pool="pool" :erc721="erc721" :erc721Metadata="item" />
                </b-col>
            </b-row>
        </template>
    </base-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseCard from './BaseCard.vue';
import BaseBadgeNetwork from '../badges/BaseBadgeNetwork.vue';
import BaseIdenticon from '../BaseIdenticon.vue';
import BaseAnchorAddress from '../BaseAnchorAddress.vue';
import type { TERC721, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';
import { format } from 'date-fns';
import { API_URL } from '@thxnetwork/dashboard/config/secrets';
import BaseModalErc721MetadataMint from '@thxnetwork/dashboard/components/modals/BaseModalERC721MetadataMint.vue';
import type { TPool } from '@thxnetwork/dashboard/store/modules/pools';

@Component({
    components: {
        BaseAnchorAddress,
        BaseCard,
        BaseBadgeNetwork,
        BaseIdenticon,
        BaseModalErc721MetadataMint,
    },
})
export default class BaseListItemERC721Metadata extends Vue {
    apiUrl = API_URL;
    format = format;
    error = '';

    @Prop() metadata!: TERC721Metadata[];
    @Prop() erc721!: TERC721;
    @Prop() pool!: TPool;

    onEdit(metadata: TERC721Metadata) {
        this.$emit('edit', metadata);
    }

    onDelete(metadata: TERC721Metadata) {
        this.$emit('delete', metadata);
    }
}
</script>
