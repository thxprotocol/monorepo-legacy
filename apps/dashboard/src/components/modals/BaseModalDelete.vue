<template>
    <b-modal
        size="lg"
        :title="`Delete ${subject}`"
        :id="id"
        no-close-on-backdrop
        no-close-on-esc
        centered
        :hide-footer="loading"
    >
        <template v-slot:modal-header v-if="loading">
            <div
                class="w-auto center-center bg-danger text-white mx-n5 mt-n5 pt-5 pb-5 flex-grow-1 flex-column position-relative"
                :style="`
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background-image: url(${require('../../../public/assets/thx_modal-header-danger.webp')});
                `"
            >
                <h2 class="d-block">Give us a moment!</h2>
                <div
                    class="shadow-sm bg-white p-2 rounded-pill d-flex align-items-center justify-content-center"
                    style="position: absolute; bottom: 0; left: 50%; margin-left: -32px; margin-bottom: -32px"
                >
                    <b-spinner size="lg" style="width: 3rem; height: 3rem" variant="primary"></b-spinner>
                </div>
            </div>
        </template>
        <div class="pt-5 pb-3" v-if="loading">
            <p class="text-center">
                <strong>We are removing your content</strong><br /><span class="text-muted">
                    Hang tight, this can take a few seconds...
                </span>
            </p>
        </div>
        <template v-else>
            <b-alert variant="danger" show v-if="error">
                {{ error }}
            </b-alert>

            <p>
                Are you sure to delete <strong>{{ subject }}</strong
                >? This action can not be undone.
            </p>
        </template>
        <template #modal-footer>
            <b-button :disabled="loading" class="rounded-pill" variant="danger" @click="$emit('submit')" block>
                Remove
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseModalDelete extends Vue {
    loading = false;

    @Prop() id!: string;
    @Prop() subject!: string;
    @Prop() error!: string;
}
</script>
