<template>
    <b-modal size="lg" :title="`Delete ${subject}`" :id="id" no-close-on-backdrop no-close-on-esc centered>
        <b-alert variant="danger" show v-if="error">
            {{ error }}
        </b-alert>
        <p>
            Are you sure to delete <strong>{{ subject }}</strong
            >? This action can not be undone.
        </p>
        <template #modal-footer>
            <b-button :disabled="loading" class="rounded-pill" variant="danger" @click="$emit('submit')" block>
                <b-spinner v-if="loading" small />
                <template v-else>Remove</template>
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseModalDelete extends Vue {
    @Prop() id!: string;
    @Prop() subject!: string;
    @Prop() error!: string;
    @Prop() loading!: boolean;
}
</script>
