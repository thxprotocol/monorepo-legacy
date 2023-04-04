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
        <div v-if="poolTransfer">
            <p>Pool transfer expires at: {{ poolTransfer.expiry }}</p>
            <b-button variant="success" :href="poolTransferPreviewURL" target="_blank">
                Go to Pool Transfer URL
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { THXWidget } from 'libs/sdk/src';
import { initWidget } from '../utils/widget';
import { TBrand } from '../store/modules/brands';
import { API_URL, BASE_URL } from '@thxnetwork/dashboard/utils/secrets';
import { format } from 'date-fns';
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
    poolTransfer: { uuid: string; expiry: string } | null = null;
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
        if (this.$route.query.poolTransfer) {
            const poolTransfer = await this.getPoolTRansfer();
            if (poolTransfer) {
                this.poolTransfer = {
                    uuid: poolTransfer.uuid,
                    expiry: format(new Date(poolTransfer.expiry), 'MM-dd-yyyy HH:mm'),
                };
            }
        }
    }

    get brand() {
        return this.brands[this.$route.params.poolId];
    }

    get poolTransferPreviewURL() {
        if (!this.poolTransfer) {
            return '#';
        }
        return `${BASE_URL}/pools/${this.$route.params.poolId}/transfer/${this.poolTransfer.uuid}`;
    }

    async getPoolTRansfer() {
        const r = await axios({
            method: 'GET',
            url: `${API_URL}/v1/pools/${this.$route.params.poolId}/transfers/${this.$route.query.poolTransfer}`,
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
