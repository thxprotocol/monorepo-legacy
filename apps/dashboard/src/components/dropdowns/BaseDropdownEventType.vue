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
        <b-dropdown-item @click="$emit('click', '')"> None </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item @click="$emit('click', event)" :key="key" v-for="(event, key) of pool.eventNames">
            <code>{{ event }}</code>
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-text>
            <b-input-group size="sm">
                <b-form-input v-model="newEvent" size="sm" placeholder="Add new event..." />
                <b-input-group-append>
                    <b-button @click="onClickSubmit" variant="primary">
                        <i class="fas fa-plus m-0" />
                    </b-button>
                </b-input-group-append>
            </b-input-group>
        </b-dropdown-text>
    </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownEventType extends Vue {
    newEvent = '';

    @Prop() pool!: TPool;
    @Prop() eventName!: string;

    onClickSubmit() {
        this.$emit('click', this.newEvent);
        this.newEvent = '';
    }
}
</script>
