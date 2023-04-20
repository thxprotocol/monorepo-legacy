<template>
    <b-form-group>
        <b-dropdown variant="link" class="dropdown-select" v-model="variant">
            <template #button-content>
                <div v-if="variant">
                    <div class="d-flex align-items-center">
                        <strong class="mr-1">{{ variant.toUpperCase() }}</strong>
                    </div>
                </div>
                <div v-else>Select Token Variant</div>
            </template>
            <b-dropdown-item-button
                :key="variant"
                v-for="variant of TokenGatingVariant"
                @click="onListItemClick(variant)"
            >
                {{ variant.toUpperCase() }}
            </b-dropdown-item-button>
        </b-dropdown>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TokenGatingVariant } from '@thxnetwork/types/enums/TokenGatingVariant';
@Component({})
export default class BaseDropDownSelectTokenGatingVariant extends Vue {
    @Prop({ required: false }) selectedValue!: any;

    TokenGatingVariant = TokenGatingVariant;
    variant: TokenGatingVariant | null = null;

    mounted() {
        this.variant = this.selectedValue ? this.selectedValue : null;
    }
    onListItemClick(variant: TokenGatingVariant | null) {
        this.variant = variant;
        this.$emit('selected', this.variant);
    }
}
</script>
