<template>
    <b-navbar-nav class="py-0">
        <b-nav-item
            :to="route.path"
            link-classes="nav-link-wrapper"
            :key="key"
            v-for="(route, key) of routes"
            class="nav-link-plain"
            :disabled="route.isSoon || (route.isPremium && ![AccountPlanType.Premium].includes(account.plan))"
        >
            <div class="nav-link-icon">
                <i :class="route.iconClasses"></i>
            </div>
            <div class="flex-grow-1 justify-content-between d-flex align-items-center">
                <span>{{ route.label }}</span>
                <b-badge v-if="route.isNew" variant="primary" class="ml-2 text-white"> New </b-badge>
                <b-badge v-if="route.isPremium" variant="gray" class="ml-2 text-white"> Premium </b-badge>
                <b-badge v-if="route.isSoon" variant="gray" class="ml-2 text-white"> Soon </b-badge>
            </div>
        </b-nav-item>
    </b-navbar-nav>
</template>

<script lang="ts">
import { AccountPlanType, type IAccount } from '@thxnetwork/dashboard/types/account';
import { IPool } from '../store/modules/pools';
import { Prop, Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

export type RouteDefinition = {
    path: string;
    label: string;
    iconClasses: string;
    isNew?: boolean;
    isSoon?: boolean;
    isPremium?: boolean;
};

@Component({
    computed: mapGetters({
        account: 'account/profile',
    }),
})
export default class BaseNavbar extends Vue {
    AccountPlanType = AccountPlanType;
    account!: IAccount;

    @Prop() routes!: RouteDefinition[];
}
</script>
