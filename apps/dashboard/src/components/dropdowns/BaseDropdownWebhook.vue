<template>
    <b-dropdown
        variant="link"
        class="dropdown-select"
        toggle-class="d-flex align-items-center"
        v-if="pool.webhooks.length"
    >
        <template #button-content>
            <div v-if="webhook" class="text-truncate">
                <i class="fas fa-globe text-muted ml-0 mr-3"></i>
                <span>{{ webhook.url }}</span>
            </div>
            <template v-else>Select a Webhook</template>
        </template>
        <b-dropdown-item-button @click="$emit('click', null)"> None </b-dropdown-item-button>
        <b-dropdown-divider />
        <b-dropdown-item-button :key="key" v-for="(w, key) of pool.webhooks" @click="$emit('click', w)">
            <code>{{ w.url }}</code>
        </b-dropdown-item-button>
        <b-dropdown-divider />
        <b-dropdown-item :to="`/developer/webhooks`"> Create Webhook </b-dropdown-item>
    </b-dropdown>
    <b-button v-else variant="light" block :to="`/developer/webhooks`"> Create Webhook </b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownWebhook extends Vue {
    @Prop() pool!: TPool;
    @Prop() webhook!: TWebhook;
}
</script>
