<template>
    <b-dropdown variant="link" class="dropdown-select">
        <template #button-content>
            <div v-if="erc20 && erc20.chainId === chainId">
                <div class="d-flex align-items-center">
                    <b-img v-if="!erc20._id" :src="erc20.logoImgUrl" class="mr-3" width="20" :alt="erc20.name" />
                    <BaseIdenticon v-else class="mr-3" :size="20" variant="darker" :uri="erc20.logoImgUrl" />
                    <strong class="mr-1">{{ erc20.symbol }}</strong>
                    {{ erc20.name }}
                </div>
            </div>
            <div v-else>Select an ERC20 token</div>
        </template>
        <b-dropdown-item-button @click="$emit('update', null)"> None </b-dropdown-item-button>
        <b-dropdown-divider />
        <b-dropdown-item v-if="!haserc20List"> No coins available. </b-dropdown-item>
        <b-dropdown-item-button
            :disabled="chainId !== erc20.chainId"
            :key="erc20._id"
            v-for="erc20 of erc20List"
            @click="$emit('update', erc20)"
        >
            <div class="d-flex align-items-center">
                <BaseIdenticon class="mr-3" size="20" variant="darker" :uri="erc20.logoImgUrl" />
                <strong class="mr-1">{{ erc20.symbol }}</strong> {{ erc20.name }}
            </div>
        </b-dropdown-item-button>
        <b-dropdown-divider />
        <b-dropdown-item-button
            :key="erc20.address"
            v-for="erc20 of tokenList"
            :disabled="chainId !== ChainId.Polygon"
            @click="$emit('update', erc20)"
        >
            <img :src="erc20.logoURI" width="20" class="mr-3" :alt="erc20.name" />
            <strong>{{ erc20.symbol }}</strong> {{ erc20.name }}
        </b-dropdown-item-button>
    </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IERC20s, TERC20 } from '@thxnetwork/dashboard/types/erc20';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import BaseIdenticon from '../BaseIdenticon.vue';

@Component({
    components: {
        BaseIdenticon,
    },
    computed: mapGetters({
        erc20List: 'erc20/all',
    }),
})
export default class ModalAssetPoolCreate extends Vue {
    ChainId = ChainId;
    tokenList: TERC20[] = [];
    erc20List!: IERC20s;

    @Prop() erc20!: TERC20;
    @Prop() chainId!: ChainId;

    get haserc20List() {
        return !!Object.values(this.erc20List).length;
    }

    async mounted() {
        await this.$store.dispatch('erc20/list');
        this.$emit('update', this.erc20);
    }
}
</script>
