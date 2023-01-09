<template>
    <div v-if="profile" class="d-flex align-items-center justify-content-center">
        <b-spinner variant="primary" class="m-auto" v-if="loading" />
        <template v-else>
            <strong v-if="!Object.values(contracts).length" class="text-gray text-center">
                No tokens are visible for your account.
            </strong>
            <b-list-group v-else class="w-100 align-self-start">
                <base-list-group-item-token :erc20="erc20" :key="erc20._id" v-for="erc20 in contracts" />
            </b-list-group>
        </template>
    </div>
</template>

<script lang="ts">
import BaseListGroupItemToken from '@thxnetwork/wallet/components/list-items/BaseListGroupItemToken.vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import { IERC20s } from '@thxnetwork/wallet/store/modules/erc20';

@Component({
    components: {
        BaseListGroupItemToken,
    },
    computed: {
        ...mapState('erc20', ['contracts']),
        ...mapGetters({
            profile: 'account/profile',
        }),
    },
})
export default class Crypto extends Vue {
    loading = true;
    contracts!: IERC20s;
    profile!: UserProfile;

    mounted() {
        this.$store.dispatch('erc20/list').then(() => {
            this.loading = false;
        });
    }
}
</script>
