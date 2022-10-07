<template>
    <b-form-select
        :value="action.type"
        class="dropdown-select bg-white"
        @change="onChangeAction"
        :options="options"
    ></b-form-select>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownChannelActions extends Vue {
    @Prop() actions!: any;
    @Prop() action!: any;

    get options() {
        return this.actions.map((action: any) => ({
            text: action.name,
            value: action.type,
        }));
    }

    mounted() {
        this.$emit('selected', this.action ? this.action : this.actions[0]);
    }

    onChangeAction(value: string) {
        const action = (this.actions as any[]).find((action) => action.type === value);
        this.$emit('selected', action);
    }
}
</script>
