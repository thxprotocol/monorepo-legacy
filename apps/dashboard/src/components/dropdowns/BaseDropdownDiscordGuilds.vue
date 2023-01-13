<template>
    <b-form-group label="Your Guilds">
        <b-dropdown variant="link" class="dropdown-select bg-white mb-3">
            <template #button-content>
                <div v-if="selected" class="text-overflow-ellipsis">
                    {{ selected.name }}
                </div>
            </template>
            <b-dropdown-item-button
                button-class="border-bottom small"
                :key="item.id"
                v-for="item of items"
                @click="onItemClick(item)"
            >
                {{ item.name }}
            </b-dropdown-item-button>
        </b-dropdown>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';

@Component({
    computed: mapGetters({}),
})
export default class BaseDropdownDiscordGuilds extends Vue {
    format = format;

    @Prop() items!: any;
    @Prop({ required: false }) item: any;

    selected: any = null;

    mounted() {
        if (!this.item && this.items[0]) {
            this.onItemClick(this.items[0]);
        }
    }

    onItemClick(item: any) {
        this.selected = item;
        this.$emit('selected', item);
    }
}
</script>
