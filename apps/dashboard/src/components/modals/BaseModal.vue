<template>
    <b-modal
        :size="size || 'lg'"
        @show="$emit('show')"
        @hidden="$emit('hidden')"
        :title="title"
        :id="id"
        no-close-on-backdrop
        centered
        :body-bg-variant="loading ? 'light' : 'white'"
        :hide-footer="loading"
        :hide-header="loading"
    >
        <div class="w-100 center-center bg-light py-3" v-if="loading">
            <div class="text-center w-100">
                <!-- <b-spinner variant="gray" /><br /> -->
                <i class="fas fa-hourglass-half text-gray mb-2" style="font-size: 2rem"> </i>
                <p class="text-muted">Please give us ~20 seconds to process your request.</p>
                <b-progress class="w-100 my-3" variant="gray" :value="100" animated></b-progress>
                <p class="text-muted small">{{ info }}</p>
            </div>
        </div>
        <b-alert variant="danger" show v-if="error">
            {{ error }}
        </b-alert>
        <slot name="modal-body"></slot>
        <template v-slot:modal-footer="{}">
            <slot name="btn-primary"></slot>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseModal extends Vue {
    @Prop() id!: string;
    @Prop() size!: string;
    @Prop() title!: string;
    @Prop() loading!: boolean;
    @Prop() error!: string;
    @Prop() hideFooter!: boolean;
    interval: any = null;
    info = '';

    mounted() {
        const messages = [
            'Preparing network request...',
            'Sending network request...',
            'Interacting with the network...',
            'Reading data from the network...',
            'Preparing network response...',
        ];
        let index = 0;
        this.info = messages[index];
        this.interval = setInterval(() => {
            if (index >= messages.length) index = 0;
            this.info = messages[index++];
        }, 3000);
    }

    beforeDestroy() {
        clearInterval(this.interval);
        this.interval = null;
    }
}
</script>
