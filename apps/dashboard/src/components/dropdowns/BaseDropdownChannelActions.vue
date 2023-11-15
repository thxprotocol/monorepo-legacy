<template>
    <b-form-select :value="action" @change="$emit('selected', $event)" :disabled="disabled">
        <b-form-select-option :value="a" :key="key" v-for="(a, key) of actions">{{ a.name }}</b-form-select-option>
    </b-form-select>
</template>

<script lang="ts">
import { type IChannelAction } from '@thxnetwork/dashboard/types/rewards';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownChannelActions extends Vue {
    @Prop() actions!: IChannelAction[];
    @Prop() action!: IChannelAction;
    @Prop() disabled!: boolean;

    mounted() {
        this.$emit('selected', this.action ? this.action : this.actions[0]);
    }
}
</script>
