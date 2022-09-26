<template>
    <div>
        <label> Your Profiles:</label>
        <b-dropdown variant="link" class="dropdown-select bg-white">
            <template #button-content>
                <div v-if="item" class="text-overflow-ellipsis">
                    {{ item.name }}<b-badge class="ml-2" variant="secondary">@{{ item.username }}</b-badge>
                </div>
            </template>
            <b-dropdown-item-button :key="item.id" v-for="item of items" @click="onItemClick(item)">
                {{ item.name }}<b-badge class="ml-2" variant="secondary">@{{ item.username }}</b-badge>
            </b-dropdown-item-button>
        </b-dropdown>
    </div>
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
export default class BaseDropdownTwitterUsers extends Vue {
    @Prop() items!: any;

    item: any = null;

    mounted() {
        this.item = this.items[0];
    }

    onItemClick(item: any) {
        this.item = item;
        this.$emit('selected', item);
    }
}
</script>
<style scoped lang="scss">
.dropdown-select .dropdown-item {
    white-space: normal;
    border-bottom: 1px solid white;

    &:last-child {
        border-bottom: 0;
    }
}
</style>
