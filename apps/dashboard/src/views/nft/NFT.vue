<template>
    <div class="container container-md pt-5" v-if="erc721">
        <router-view :erc721="erc721"></router-view>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IAccount } from '../../types/account';
import { IERC721s } from '@thxnetwork/dashboard/types/erc721';

@Component({
    computed: mapGetters({
        erc721s: 'erc721/all',
        account: 'account/profile',
    }),
})
export default class PoolView extends Vue {
    account!: IAccount;
    erc721s!: IERC721s;

    get erc721() {
        return this.erc721s[this.$route.params.erc721Id];
    }

    async mounted() {
        this.$store.dispatch('account/getProfile');
        await this.$store.dispatch('erc721/read', this.$route.params.erc721Id);
    }
}
</script>
