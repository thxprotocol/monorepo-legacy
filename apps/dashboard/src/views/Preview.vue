<template>
    <div class="text-center">
        <img
            v-if="brand && brand.logoImgUrl"
            v-b-tooltip
            :title="`Preview of loyalty widget`"
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
import { API_URL } from '@thxnetwork/dashboard/utils/secrets';
import axios from 'axios';

@Component({
    computed: mapGetters({
        brands: 'brands/all',
        account: 'account/profile',
    }),
})
export default class PoolView extends Vue {
    widget: THXWidget | null = null;
    brands!: { [poolId: string]: TBrand };
    logoImgUrl = '';
    backgroundImgUrl = '';

    async mounted() {
        const poolId = this.$route.params.poolId;
        initWidget(poolId);

        await this.$store.dispatch('brands/getForPool', poolId);
        const app = document.getElementById('app');
        if (app) {
            app.style.opacity = '1';
            if (this.brand) {
                app.style.backgroundImage = this.brand.backgroundImgUrl ? `url('${this.brand.backgroundImgUrl}')` : '';
            }
        }
        if (this.$route.query.pooltransfer) {
            const poolTransfer = await this.getPoolTRansfer();
            console.log('poolTransfer', poolTransfer);
        }
    }

    get brand() {
        return this.brands[this.$route.params.poolId];
    }

    async getPoolTRansfer() {
        const r = await axios({
            method: 'GET',
            url: `${API_URL}/v1/pools/${this.$route.params.poolId}/transfers/${this.$route.query.pooltransfer}`,
            withCredentials: false,
        });

        return r.data;
    }
}
</script>
<style>
#app {
    background-size: cover;
    background-repeat: no-repeat;
}
</style>
