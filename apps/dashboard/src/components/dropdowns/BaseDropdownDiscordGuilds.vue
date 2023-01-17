<template>
    <div>
        <b-form-group label="Your Guilds">
            <b-dropdown variant="link" class="dropdown-select bg-white mb-3">
                <template #button-content>
                    <div v-if="selected" class="text-overflow-ellipsis">
                        {{ selected.name }}
                    </div>
                </template>
                <b-dropdown-item-button button-class="border-bottom small" :key="item.id" v-for="item of items"
                    @click="onItemClick(item)">
                    {{ item.name }}
                </b-dropdown-item-button>
            </b-dropdown>
        </b-form-group>
        <b-form-group label="Invite Link">
            <b-form-input type="text" v-model="innerUrl" />
        </b-form-group>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';

@Component({
    computed: mapGetters({}),
})
export default class BaseDropdownDiscordGuilds extends Vue {

    @Prop() items!: any;
    @Prop({ required: false }) item: any;
    @Prop() url!: string

    selected: any = null;
    format = format;
    innerUrl = this.url || ''

    @Watch('innerUrl')
    onChange() {
        this.$emit('changed', this.innerUrl);
    }

    mounted() {
        if (!this.item && this.items[0]) {
            this.onItemClick(this.items[0]);
        } else {
            const selected = this.items.find((item: any) => item.id === this.item)
            if (selected) this.selected = selected
        }
    }

    onItemClick(item: any) {
        this.selected = item;
        this.$emit('selected', item);
    }


}
</script>
