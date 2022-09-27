<template>
    <div>
        <label>Your Tracks:</label>
        <b-dropdown variant="link" class="dropdown-select bg-white mb-3">
            <template #button-content>
                <div v-if="selected" class="d-flex align-items-center text-overflow-ellipsis">
                    <img
                        :src="selected.track.album.images[0].url"
                        v-if="selected.track.album.images[0].url"
                        width="30"
                        class="mr-2"
                        :alt="selected.track.name"
                    />
                    {{ selected.track.name }}
                </div>
            </template>
            <b-dropdown-item-button :key="item.track.id" v-for="item of items" @click="onItemClick(item)">
                <div class="d-flex overflow-hidden">
                    <div class="d-flex align-items-center">
                        <img
                            :src="item.track.album.images[0].url"
                            v-if="item.track.album.images[0].url"
                            height="50"
                            width="auto"
                            class="mr-3"
                            :alt="item.track.name"
                        />
                    </div>
                    <div class="d-flex align-items-center">
                        <div>
                            {{ item.track.name }}
                        </div>
                    </div>
                </div>
            </b-dropdown-item-button>
        </b-dropdown>

        <label>Spotify Track URL:</label>
        <b-form-input
            :class="{ 'is-valid': trackId.length }"
            class="mb-3"
            placeholder="https://open.spotify.com/track/3Xvvu6znhWYasoqzAbn2Hd"
            v-model="url"
        />

        <b-alert show variant="info" v-if="trackId">
            Spotify Track ID: <strong> {{ trackId }}</strong>
        </b-alert>
    </div>
</template>

<script lang="ts">
import { BAlert, BButton, BFormInput, BInputGroup, BInputGroupAppend } from 'bootstrap-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        BAlert,
        BButton,
        BInputGroup,
        BFormInput,
        BInputGroupAppend,
    },
    computed: mapGetters({}),
})
export default class BaseDropdownSpotifyTrack extends Vue {
    @Prop() items!: any;
    @Prop({ required: false }) item: any;

    url = '';
    trackId = '';

    selected: any = null;

    mounted() {
        if (!this.item) {
            this.selected = this.items[0];
            this.$emit('selected', { id: this.selected.id });
        } else {
            const isUserTrack = this.items.find((playlist: any) => playlist.track.id === this.item);
            console.log(this.items, this.item);

            if (isUserTrack) this.selected = isUserTrack;
            else {
                this.selected = this.items[0];
                this.url = `https://open.spotify.com/track/${this.item}`;
            }
        }
    }

    onItemClick(item: any) {
        this.selected = item;
        this.$emit('selected', { id: this.selected.track.id });
    }

    @Watch('url')
    onChange(url: string) {
        const result = url.replace(/.*\/(?:track)\/([\w-]{22}).*/, '$1');

        if (result !== this.url) {
            this.trackId = result;
            this.$emit('selected', { id: result });
        } else {
            this.trackId = '';
        }
    }
}
</script>
