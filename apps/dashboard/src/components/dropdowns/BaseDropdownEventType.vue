<template>
    <b-dropdown
        variant="light"
        class="w-100"
        menu-class="w-100"
        toggle-class="justify-content-between align-items-center d-flex form-control"
    >
        <template #button-content>
            {{ eventName ? eventName : 'Choose an event...' }}
        </template>
        <b-dropdown-item @click="$emit('click', event)" :key="key" v-for="(event, key) of events">
            {{ event }}
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownEventType extends Vue {
    @Prop() events!: string[];
    @Prop() eventName!: string;
}
</script>
