<template>
    <b-card
        class="mb-3 shadow-sm"
        :class="classes"
        @click="$emit('click')"
        header-bg-variant="light"
        :body-bg-variant="bodyBgVariant"
        header-class="py-2 pr-0"
    >
        <template #header>
            <div class="d-flex align-items-center justify-content-between">
                <slot name="card-header"></slot>
            </div>
        </template>
        <div v-if="isLoading" class="p-3 text-center">
            <div class="w-100 text-gray text-center">
                <b-spinner variant="gray" class="mb-2" />
                <p v-if="isDeploying" class="m-0">We are deploying your smart contract. Give us a moment!</p>
            </div>
        </div>
        <slot v-else name="card-body"></slot>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseCard extends Vue {
    @Prop() isDeploying!: boolean;
    @Prop() isLoading!: boolean;
    @Prop() classes!: string;
    @Prop() bodyBgVariant!: string;
}
</script>
