<template>
    <div>
        <b-alert variant="success" show> Event Listeners are on the verge to be released. Stay tuned. </b-alert>
        <p>
            Event listeners will allow you to provide an endpoint from your system. We will use that endpoint to send
            realtime data for important system events regarding your campaign.
        </p>
    </div>
</template>
<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';

@Component({
    components: {},
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class Clients extends Vue {
    pools!: IPools;

    get pool() {
        return this.pools[this.$route.params.id];
    }
}
</script>
