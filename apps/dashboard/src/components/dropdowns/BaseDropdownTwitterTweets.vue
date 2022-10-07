<template>
    <div>
        <label> Your Tweets:</label>
        <b-dropdown variant="link" class="dropdown-select bg-white">
            <template #button-content>
                <div v-if="selected" class="text-overflow-ellipsis">
                    {{ selected.text }}
                </div>
            </template>
            <b-dropdown-item-button
                button-class="border-bottom small"
                :key="item.id"
                v-for="item of items"
                @click="onItemClick(item)"
            >
                <span class="text-muted"> {{ format(new Date(item.created_at), 'HH:mm MMMM dd, yyyy') }}</span
                ><br />
                {{ item.text }}
            </b-dropdown-item-button>
        </b-dropdown>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';

@Component({
    computed: mapGetters({}),
})
export default class BaseDropdownTwitterTweets extends Vue {
    format = format;

    @Prop() items!: any;
    @Prop({ required: false }) item: any;

    selected: any = null;

    mounted() {
        if (!this.item) {
            this.onItemClick(this.items[0]);
        } else {
            for (const key in this.items) {
                const tweet = this.items[key].referenced_tweets[0];
                if (tweet.id === this.item) {
                    this.onItemClick(this.items[key]);
                    break;
                }
            }
        }
    }

    onItemClick(item: any) {
        this.selected = item;
        this.$emit('selected', item);
    }
}
</script>
