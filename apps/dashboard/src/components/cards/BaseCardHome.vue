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
            body-class="p-2"
            class="mb-3 cursor-pointer bg-light"
            :class="{ 'shadow-sm': hover, 'bg-white': hover }"
        >
            <slot></slot>
        </b-card>
    </b-skeleton-wrapper>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
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
