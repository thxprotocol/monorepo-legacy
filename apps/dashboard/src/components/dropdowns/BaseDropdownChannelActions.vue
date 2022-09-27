<template>
    <b-form-select
        :value="action.type"
        class="dropdown-select bg-white"
        @change="onActionClick"
        :options="options"
    ></b-form-select>
</template>

<script lang="ts">
import { BDropdown, BDropdownItemButton, BBadge, BSpinner } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        BBadge,
        BDropdown,
        BDropdownItemButton,
        BSpinner,
    },
    computed: mapGetters({}),
})
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
        if (!this.action) {
            this.$emit('selected', this.actions[0]);
        }
    }

    onActionClick(value: string) {
        const action = (this.actions as any[]).find((action) => action.type === value);
        this.$emit('selected', action);
    }
}
</script>
