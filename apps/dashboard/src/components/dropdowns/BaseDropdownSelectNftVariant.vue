<template>
    <b-form-group label="NFT Standard">
        <b-dropdown variant="link" class="dropdown-select">
            <template #button-content>
                <div v-if="variant">
                    <div class="d-flex align-items-center">
                        <strong class="mr-1">{{ variant.toUpperCase() }}</strong>
                    </div>
                </div>
                <div v-else>Select an NFT Standard</div>
            </template>
            <b-dropdown-item-button :key="variant" v-for="variant of NFTVariant" @click="onListItemClick(variant)">
                {{ variant.toUpperCase() }}
            </b-dropdown-item-button>
        </b-dropdown>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { NFTVariant } from '@thxnetwork/common/enums';

@Component({})
export default class ModalAssetPoolCreate extends Vue {
    NFTVariant = NFTVariant;
    variant: NFTVariant | null = null;

    onListItemClick(variant: NFTVariant | null) {
        this.variant = variant;
        this.$emit('selected', this.variant);
    }
}
</script>
