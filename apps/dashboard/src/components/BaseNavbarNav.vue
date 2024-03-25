<template>
    <b-navbar-nav class="py-0">
        <b-nav-item
            :to="route.path"
            :link-classes="`nav-link-wrapper ${route.children.length && 'has-children'}`"
            :key="key"
            v-for="(route, key) of routes"
            class="nav-link-plain"
            v-b-toggle.stop="`collapse-${key}`"
            :disabled="route.isSoon || (route.isPremium && ![AccountPlanType.Premium].includes(account.plan))"
        >
            <div class="d-flex">
                <div class="nav-link-icon">
                    <i :class="route.iconClasses"></i>
                </div>
                <div class="flex-grow-1 justify-content-between d-flex align-items-center">
                    <span>{{ route.label }}</span>
                    <b-badge v-if="route.isNew" variant="primary" class="ml-2 text-white"> New </b-badge>
                    <b-badge v-if="route.isPremium" variant="gray" class="ml-2 text-white"> Premium </b-badge>
                    <b-badge v-if="route.isSoon" variant="gray" class="ml-2 text-white"> Soon </b-badge>
                    <div v-if="route.isActive === false" variant="gray" class="mr-3">
                        <i class="fas fa-exclamation text-danger"></i>
                    </div>
                </div>
                <div class="flex-grow-1 text-right p-2" v-if="route.children.length">
                    <i class="fas fa-caret-down ml-0"></i>
                </div>
            </div>
            <b-collapse is-nav :id="`collapse-${key}`" class="w-100">
                <b-navbar-nav>
                    <b-nav-item
                        @click.stop="$router.push(child.path)"
                        link-classes="nav-link-wrapper flex-row"
                        :key="key"
                        v-for="(child, key) of route.children"
                        class="nav-link-plain"
                        :disabled="
                            child.isSoon || (route.isPremium && ![AccountPlanType.Premium].includes(account.plan))
                        "
                    >
                        <div class="nav-link-icon">
                            <i :class="child.iconClasses"></i>
                        </div>
                        <div class="flex-grow-1 justify-content-between d-flex align-items-center">
                            <span>{{ child.label }}</span>
                        </div>
                    </b-nav-item>
                </b-navbar-nav>
            </b-collapse>
        </b-nav-item>
    </b-navbar-nav>
</template>

<script lang="ts">
import { AccountPlanType } from '@thxnetwork/common/enums';
import { Prop, Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

export type RouteDefinition = {
    path: string;
    label: string;
    iconClasses: string;
    isNew?: boolean;
    isSoon?: boolean;
    isPremium?: boolean;
    isActive?: boolean;
    children: RouteDefinition[];
};

@Component({
    computed: mapGetters({
        account: 'account/profile',
    }),
})
export default class BaseNavbar extends Vue {
    AccountPlanType = AccountPlanType;
    account!: TAccount;

    @Prop() routes!: RouteDefinition[];
}
</script>
