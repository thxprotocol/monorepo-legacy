<template>
    <div>
        <label> Your Channels:</label>
        <b-dropdown variant="link" class="dropdown-select bg-white">
            <template #button-content>
                <div v-if="item" class="d-flex align-items-center text-overflow-ellipsis">
                    <img :src="item.thumbnailURI" v-if="item.thumbnailURI" width="30" class="mr-2" :alt="item.title" />
                    {{ item.title }}
                </div>
            </template>
            <b-dropdown-item-button :key="item.id" v-for="item of items" @click="onItemClick(item)">
                <div class="d-flex">
                    <div class="d-flex align-items-center">
                        <img
                            :src="item.thumbnailURI"
                            v-if="item.thumbnailURI"
                            height="50"
                            width="auto"
                            class="mr-3"
                            :alt="item.title"
                        />
                    </div>
                    <div class="d-flex align-items-center">
                        <div>
                            {{ item.title }}
                        </div>
                    </div>
                </div>
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
export default class BaseDropdownYoutubeChannels extends Vue {
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
