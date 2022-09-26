<template>
    <b-skeleton-wrapper :loading="loading">
        <template #loading>
            <b-card class="mb-3 shadow-sm cursor-pointer">
                <div class="w-100 py-3 text-gray text-center" v-if="isDeploying">
                    <b-spinner variant="gray" class="mb-2" />
                    <p class="m-0">We are deploying your smart contract. Give us a moment!</p>
                </div>
                <template v-else>
                    <b-skeleton animation="fade" class="mb-3" width="75%"></b-skeleton>
                    <b-skeleton animation="fade" class="mb-3" width="50%"></b-skeleton>
                    <hr />
                    <b-skeleton type="button" animation="fade" class="rounded-pill" width="100%"></b-skeleton>
                </template>
            </b-card>
        </template>
        <b-card
            class="mb-3 shadow-sm"
            :class="classes"
            @click="$emit('click')"
            header-bg-variant="light"
            header-class="p-0 small text-center border-0"
            footer-class="text-white p-0 small text-center border-0"
        >
            <template #header>
                <slot name="card-header"></slot>
            </template>
            <slot name="card-body"></slot>
            <template #footer>
                <slot name="card-footer"></slot>
            </template>
        </b-card>
    </b-skeleton-wrapper>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseCard extends Vue {
    @Prop() isDeploying!: boolean;
    @Prop() loading!: boolean;
    @Prop() classes!: string;
}
</script>
