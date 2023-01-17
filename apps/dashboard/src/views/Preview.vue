<template>
    <div class="text-center">
        <img
            v-if="brand && brand.logoImgUrl"
            v-b-tooltip
            :title="`Preview of loyalty widget for ${pool.title}`"
            :src="brand.logoImgUrl"
            width="150"
            alt="Example logo image"
            class="mb-3"
        />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { THXWidget } from 'libs/sdk/src';
import { initWidget } from '../utils/widget';
import { TBrand } from '../store/modules/brands';
import { IPools } from '../store/modules/pools';

@Component({
    computed: mapGetters({
        brands: 'brands/all',
        pools: 'pools/all',
        account: 'account/profile',
    }),
})
export default class PoolView extends Vue {
    widget: THXWidget | null = null;
    pools!: IPools;
    brands!: { [poolId: string]: TBrand };
    logoImgUrl = '';
    backgroundImgUrl = '';

    async mounted() {
        const poolId = this.$route.params.poolId;
        initWidget(poolId);

        await this.$store.dispatch('pools/read', poolId);
        await this.$store.dispatch('brands/getForPool', this.pool);

        const app = document.getElementById('app');
        if (app) {
            app.style.opacity = '1';
            app.style.backgroundImage = this.brand.backgroundImgUrl ? `url('${this.brand.backgroundImgUrl}')` : '';
        }
    }

    get brand() {
        return this.brands[this.$route.params.poolId];
    }

    get pool() {
        return this.pools[this.$route.params.poolId];
    }
}
</script>
<style>
#app {
    background-size: cover;
    background-repeat: no-repeat;
}
</style>
