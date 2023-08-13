<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <strong>Events</strong>
                <p class="text-muted">...</p>
            </b-col>
            <b-col md="8">
                <b-list-group>
                    <b-list-group-item class="py-1 d-flex" :key="key" v-for="(event, key) of [1, 2, 3, 4]">
                        <div>EventName</div>
                        <div class="ml-auto">{{ Date.now() }}</div>
                    </b-list-group-item>
                </b-list-group>
            </b-col>
        </b-form-row>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import type { TAccount } from '@thxnetwork/types/interfaces';
import BaseCodeExample from '@thxnetwork/dashboard/components/BaseCodeExample.vue';

@Component({
    components: {
        BaseCodeExample,
    },
    computed: {
        ...mapGetters({
            pools: 'pools/all',
            profile: 'account/profile',
            widgets: 'widgets/all',
        }),
    },
})
export default class SettingsView extends Vue {
    loading = true;
    isValidUrl = isValidUrl;
    profile!: TAccount;
    pools!: IPools;
    error: string | null = null;

    get pool() {
        return this.pools[this.$route.params.id];
    }
}
</script>
