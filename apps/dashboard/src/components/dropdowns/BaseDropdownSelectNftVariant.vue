<template>
    <div>
        <b-form-group>
            <label>Nft Type</label>
            <b-dropdown variant="link" class="dropdown-select">
                <template #button-content>
                    <div v-if="variant">
                        <div class="d-flex align-items-center">
                            <strong class="mr-1">{{ variant.toUpperCase() }}</strong>
                        </div>
                    </div>
                    <div v-else>Select the Nft type</div>
                </template>
                <b-dropdown-divider />

                <b-dropdown-item-button :key="variant" v-for="variant of NftVariant" @click="onListItemClick(variant)">
                    <strong>{{ variant.toUpperCase() }}</strong>
                </b-dropdown-item-button>
            </b-dropdown>
        </b-form-group>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { NftVariant } from '@thxnetwork/dashboard/types/enums/NftVariant';
@Component({})
export default class ModalAssetPoolCreate extends Vue {
    NftVariant = NftVariant;
    variant: NftVariant | null = null;

    onListItemClick(variant: NftVariant | null) {
        this.variant = variant;
        this.$emit('selected', this.variant);
    }
}
</script>
