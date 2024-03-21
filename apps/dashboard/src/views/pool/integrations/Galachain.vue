<template>
    <div v-if="pool">
        <b-form-row>
            <b-col md="4">
                <div>
                    <strong>Token Transfers</strong>
                </div>
                <p class="text-muted">Register a user in your channel that can be used for token distribution.</p>
            </b-col>
            <b-col md="8">
                <b-form-group label="Galachain private key">
                    <b-form-input :value="pool.settings.galachainPrivateKey" readonly />
                </b-form-group>
                <b-alert show variant="warning" class="d-flex align-items-center">
                    <i class="fas fa-exclamation-triangle mr-2" /> Never expose this key publically.
                </b-alert>
            </b-col>
        </b-form-row>
    </div>
</template>
<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: {
        ...mapGetters({
            pools: 'pools/all',
        }),
    },
})
export default class IntegrationTwitterView extends Vue {
    privateKey = '';
    pools!: IPools;

    get pool() {
        return this.pools[this.$route.params.id];
    }
}
</script>
