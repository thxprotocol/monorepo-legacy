<template>
    <b-skeleton-wrapper :loading="loading">
        <template #loading>
            <b-card style="height: 140px" class="my-3">
                <b-skeleton animation="wave" width="85%"></b-skeleton>
                <hr />
                <b-skeleton animation="wave" width="85%"></b-skeleton>
                <b-skeleton animation="wave" width="55%"></b-skeleton>
            </b-card>
        </template>
        <b-card
            @click="$router.push(url)"
            @mouseover="hover = true"
            @mouseleave="hover = false"
            class="mt-3 mb-3 cursor-pointer"
            :class="{ 'shadow-sm': hover }"
        >
            <template #header>
                <slot name="header"></slot>
            </template>
            <p class="m-0" :class="hover ? 'text-dark' : 'text-muted'">
                <slot></slot>
            </p>
        </b-card>
    </b-skeleton-wrapper>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModalRequestAccountEmailUpdate from '@thxnetwork/dashboard/components/modals/BaseModalRequestAccountEmailUpdate.vue';
import BaseModalOnboarding from '@thxnetwork/dashboard/components/modals/BaseModalOnboarding.vue';

@Component({
    components: {
        BaseModalRequestAccountEmailUpdate,
        BaseModalOnboarding,
    },
    computed: mapGetters({
        profile: 'account/profile',
        pools: 'pools/all',
    }),
})
export default class BaseCardReward extends Vue {
    hover = false;

    @Prop() loading!: boolean;
    @Prop() url!: string;
}
</script>

<style scoped>
.card {
    transition: box-shadow ease 0.25s, color ease 0.25s;
}
</style>
