<template>
    <b-dropdown
        variant="light"
        class="w-100 dropdown-select-multiple"
        menu-class="p-0 w-100"
        toggle-class="d-flex justify-content-between align-items-center p-2 px-3 form-control"
    >
        <template #button-content>
            <div>
                <b-badge
                    v-for="(option, key) of selected"
                    variant="primary"
                    :key="key"
                    class="p-1 pl-3 font-weight-normal center-center d-inline-flex mr-2 rounded-pill"
                >
                    {{ option.label }}
                    <b-button
                        variant="dark"
                        size="sm"
                        class="rounded-pill p-0 ml-2"
                        @click="$emit('remove', option.value)"
                        style="height: 25px; width: 25px"
                    >
                        <i class="fas fa-times ml-0" style="margin: 0" />
                    </b-button>
                </b-badge>
            </div>
        </template>
        <b-dropdown-item-btn
            v-for="(option, key) of options"
            @click="$emit('select', option.value)"
            :key="key"
            :active="option.selected"
            :disabled="option.disabled"
        >
            <b-img v-if="option.img" width="20" height="20" :src="option.img" class="mr-2 rounded" />
            <b-avatar v-else size="20" :text="option.label.substring(0, 1)" class="mr-2" />
            {{ option.label }}
            <b-badge v-if="option.icon" class="ml-auto" style="width: 20px" :variant="option.icon.variant">
                <i :class="option.icon.class" />
            </b-badge>
        </b-dropdown-item-btn>
    </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownSelectMultiple extends Vue {
    @Prop() options!: {
        img: string;
        label: string;
        value: any;
        disabled: boolean;
        selected: boolean;
        icon?: { variant: string; class: string };
    }[];

    get selected() {
        return this.options.filter((option) => option.selected);
    }
}
</script>
<style lang="scss">
.dropdown-select-multiple {
    button.dropdown-item {
        display: flex;
        align-items: center;
    }
}
</style>
