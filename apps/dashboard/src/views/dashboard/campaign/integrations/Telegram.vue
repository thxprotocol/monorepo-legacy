<template>
    <div>
        <b-form-row> </b-form-row>
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
export default class IntegrationTelegramView extends Vue {
    pools!: IPools;

    get pool() {
        return this.pools[this.$route.params.id];
    }
}
</script>
